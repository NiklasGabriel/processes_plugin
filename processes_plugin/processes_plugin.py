"""Processes plugin for InvenTree."""

import json
from uuid import uuid4

from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.urls import path
from django.utils.html import escape

from part.models import Part
from part.models import BOMItem
from stock.models import StockItem, StockLocation, StockHistoryCode
from plugin import ActionMixin, SettingsMixin, UserInterfaceMixin, InvenTreePlugin
from plugin.mixins import BarcodeMixin, UrlsMixin


class ProcessesPlugin(
    SettingsMixin,
    UserInterfaceMixin,
    ActionMixin,
    BarcodeMixin,
    UrlsMixin,
    InvenTreePlugin,
):
    """Placeholder plugin class for process-related extensions."""

    NAME = "Processes Plugin"
    SLUG = "processes"
    TITLE = "Processes"
    DESCRIPTION = "Placeholder plugin for process-related extensions"
    VERSION = "0.1.0"
    SETTINGS = {
        "PROCESSES_JSON": {
            "name": "Processes JSON",
            "description": "List of processes as JSON",
            "type": "string",
            "default": "[]",
        },
        "DEFAULT_OUTPUT_LOCATION": {
            "name": "Default Output Location",
            "description": "Default output location (optional)",
            "type": "string",
            "default": "",
        },
        "ENABLE_PART_PANEL": {
            "name": "Enable Part Panel",
            "description": "Show processes panel on part detail pages",
            "type": "bool",
            "default": True,
        },
    }

    def get_ui_panels(self, request, context):
        """Return UI panels for part detail pages."""
        if not self.get_setting("ENABLE_PART_PANEL", True):
            return []
        if context.get("target_model") != "part":
            return []

        return [
            {
                "title": "Prozesse",
                "icon": "ti:settings:outline",
                "source": self.plugin_static_file("processes_panel.js"),
                "context": {
                    "target_model": context.get("target_model"),
                    "target_id": context.get("target_id"),
                },
            }
        ]

    def _load_processes(self):
        """Load processes list from settings."""
        raw = self.get_setting("PROCESSES_JSON", "[]") or "[]"
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return []

        return data if isinstance(data, list) else []

    def _save_processes(self, processes):
        """Validate and save processes list to settings."""
        if not isinstance(processes, list):
            raise ValueError("Processes must be a list")

        for process in processes:
            if not isinstance(process, dict):
                raise ValueError("Each process must be an object")
            name = process.get("name")
            output_part_id = process.get("output_part_id")
            if not name:
                raise ValueError("Process requires a name")
            if not isinstance(output_part_id, int):
                raise ValueError("Process requires output_part_id int")

        self.set_setting("PROCESSES_JSON", json.dumps(processes))

    def _find_process(self, process_id):
        """Find a process by id."""
        for process in self._load_processes():
            if process.get("id") == process_id:
                return process
        return None

    def _new_id(self):
        """Generate a new process id."""
        return str(uuid4())

    def perform_action(self, request, action, data):
        """Handle plugin actions."""
        if action not in {"processes_plugin", "processes"}:
            return {"ok": False, "error": "Unknown action"}

        method = (data or {}).get("method")
        if method == "list":
            return {"ok": True, "processes": self._load_processes()}

        if method == "bom_preview":
            output_part_id = (data or {}).get("output_part_id")
            if not isinstance(output_part_id, int):
                return {"ok": False, "error": "output_part_id must be int"}

            try:
                output_part = Part.objects.get(pk=output_part_id)
            except ObjectDoesNotExist:
                return {"ok": False, "error": "output_part_id not found"}

            bom_lines = []
            for bom_item in BOMItem.objects.filter(part=output_part):
                line = {
                    "part_id": bom_item.sub_part_id,
                    "part_name": bom_item.sub_part.name if bom_item.sub_part else "",
                    "quantity": str(bom_item.quantity),
                }
                if bom_item.reference:
                    line["reference"] = bom_item.reference
                bom_lines.append(line)

            return {"ok": True, "bom": bom_lines}

        if method in {"create", "update"}:
            payload = data or {}
            name = payload.get("name")
            output_part_id = payload.get("output_part_id")

            if not name:
                return {"ok": False, "error": "name is required"}
            if not isinstance(output_part_id, int):
                return {"ok": False, "error": "output_part_id must be int"}

            try:
                output_part = Part.objects.get(pk=output_part_id)
            except ObjectDoesNotExist:
                return {"ok": False, "error": "output_part_id not found"}

            if not BOMItem.objects.filter(part=output_part).exists():
                return {"ok": False, "error": "output_part_id has no BOM items"}

            processes = self._load_processes()

            if method == "create":
                new_process = {
                    "id": self._new_id(),
                    "name": name,
                    "output_part_id": output_part_id,
                }
                processes.append(new_process)
                self._save_processes(processes)
                return {"ok": True, "process": new_process}

            process_id = payload.get("id")
            if not process_id:
                return {"ok": False, "error": "id is required"}

            updated = None
            for process in processes:
                if process.get("id") == process_id:
                    process["name"] = name
                    process["output_part_id"] = output_part_id
                    updated = process
                    break

            if updated is None:
                return {"ok": False, "error": "process not found"}

            self._save_processes(processes)
            return {"ok": True, "process": updated}

        if method == "delete":
            process_id = (data or {}).get("id")
            if not process_id:
                return {"ok": False, "error": "id is required"}

            processes = self._load_processes()
            new_processes = [p for p in processes if p.get("id") != process_id]
            if len(new_processes) == len(processes):
                return {"ok": False, "error": "process not found"}

            self._save_processes(new_processes)
            return {"ok": True}

        if method == "duplicate":
            process_id = (data or {}).get("id")
            if not process_id:
                return {"ok": False, "error": "id is required"}

            process = self._find_process(process_id)
            if not process:
                return {"ok": False, "error": "process not found"}

            duplicate = {
                "id": self._new_id(),
                "name": f'{process.get("name", "").strip()} (Copy)'.strip(),
                "output_part_id": process.get("output_part_id"),
            }
            processes = self._load_processes()
            processes.append(duplicate)
            self._save_processes(processes)
            return {"ok": True, "process": duplicate}

        if method == "run":
            payload = data or {}
            process_id = payload.get("id")
            n = payload.get("n")
            note = payload.get("note")

            if not process_id:
                return {"ok": False, "error": "id is required"}
            if not isinstance(n, int) or n < 1:
                return {"ok": False, "error": "n must be int >= 1"}

            process = self._find_process(process_id)
            if not process:
                return {"ok": False, "error": "process not found"}

            try:
                output_part = Part.objects.get(pk=process.get("output_part_id"))
            except ObjectDoesNotExist:
                return {"ok": False, "error": "output_part_id not found"}

            bom_items = list(BOMItem.objects.filter(part=output_part))
            if not bom_items:
                return {"ok": False, "error": "output_part_id has no BOM items"}

            consumed = []
            produced = None
            warnings = []
            default_note = note or f'Process run: {process.get("name", "").strip() or process_id}'

            class _ProcessRunError(Exception):
                pass

            try:
                with transaction.atomic():
                    for bom_item in bom_items:
                        total_remove = bom_item.quantity * n
                        stock_qs = StockItem.objects.filter(part=bom_item.sub_part)
                        stock_item = (
                            stock_qs.filter(quantity__gt=0).order_by("pk").first()
                            or stock_qs.order_by("pk").first()
                        )
                        if stock_item is None:
                            raise _ProcessRunError(
                                f"No stock item for part {bom_item.sub_part_id}"
                            )
                        if stock_item.quantity < total_remove:
                            raise _ProcessRunError(
                                f"Insufficient stock for part {bom_item.sub_part_id}"
                            )

                        stock_item.take_stock(
                            total_remove,
                            request.user if request else None,
                            code=StockHistoryCode.STOCK_REMOVE,
                            notes=default_note,
                        )
                        consumed.append(
                            {
                                "part_id": bom_item.sub_part_id,
                                "stock_item_id": stock_item.pk,
                                "qty": str(total_remove),
                            }
                        )

                    output_qs = StockItem.objects.filter(part=output_part)
                    output_stock = (
                        output_qs.filter(quantity__gt=0).order_by("pk").first()
                        or output_qs.order_by("pk").first()
                    )

                    if output_stock is None:
                        location_id = self.get_setting(
                            "DEFAULT_OUTPUT_LOCATION", ""
                        ) or ""
                        if not location_id:
                            raise _ProcessRunError(
                                "No output stock item and no default output location"
                            )

                        try:
                            location = StockLocation.objects.get(pk=location_id)
                        except ObjectDoesNotExist:
                            raise _ProcessRunError(
                                "Default output location not found"
                            )

                        output_stock = StockItem.objects.create(
                            part=output_part,
                            location=location,
                            quantity=0,
                        )
                        warnings.append("created_new_stockitem")

                    output_stock.add_stock(
                        n,
                        request.user if request else None,
                        notes=default_note,
                    )
                    produced = {
                        "part_id": output_part.pk,
                        "stock_item_id": output_stock.pk,
                        "qty": str(n),
                    }
            except _ProcessRunError as exc:
                return {"ok": False, "error": str(exc)}

            return {
                "ok": True,
                "consumed": consumed,
                "produced": produced,
                "warnings": warnings,
            }

        return {"ok": False, "error": "Unknown method"}

    def scan(self, barcode_data):
        """Scan custom process barcodes."""
        if not isinstance(barcode_data, str):
            return None

        if not barcode_data.startswith("PROC:"):
            return None

        process_id = barcode_data.split("PROC:", 1)[1].strip()
        if not process_id:
            return None

        process = self._find_process(process_id)
        if not process:
            return None

        output_part_id = process.get("output_part_id")
        if not isinstance(output_part_id, int):
            return None

        try:
            output_part = Part.objects.get(pk=output_part_id)
        except Part.DoesNotExist:
            return None

        label = Part.barcode_model_type()
        return {
            label: output_part.format_matched_response(),
            "run_url": f"/plugins/processes_plugin/run/{process_id}/",
        }

    def setup_urls(self):
        return [
            path("run/<str:process_id>/", self.view_run, name="processes-run"),
        ]

    def view_run(self, request, process_id):
        process = self._find_process(process_id)
        if not process:
            return HttpResponse("Process not found", status=404)

        output_part_id = process.get("output_part_id")
        try:
            output_part = Part.objects.get(pk=output_part_id)
        except ObjectDoesNotExist:
            return HttpResponse("Output part not found", status=404)

        bom_items = list(BOMItem.objects.filter(part=output_part))
        bom_lines = [
            {
                "part_name": item.sub_part.name if item.sub_part else "",
                "quantity": str(item.quantity),
            }
            for item in bom_items
        ]

        html = f"""
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{escape(process.get("name", "Prozess"))}</title>
    <style>
      body {{ font-family: Arial, sans-serif; padding: 16px; background: #f8f9fa; }}
      .card {{ background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }}
      h1 {{ font-size: 22px; margin: 0 0 4px; }}
      h2 {{ font-size: 16px; margin: 0 0 12px; color: #555; }}
      .bom {{ margin: 12px 0; font-size: 14px; }}
      .bom .plus {{ color: #198754; }}
      .bom .minus {{ color: #dc3545; }}
      .field {{ margin: 12px 0; }}
      input[type=number] {{ width: 100%; padding: 10px; font-size: 16px; }}
      button {{ width: 100%; padding: 12px; font-size: 16px; background: #0d6efd; color: #fff; border: none; border-radius: 6px; }}
      .message {{ margin-top: 12px; padding: 12px; border-radius: 6px; }}
      .success {{ background: #d1e7dd; color: #0f5132; }}
      .error {{ background: #f8d7da; color: #842029; }}
      .warning {{ background: #fff3cd; color: #664d03; margin-top: 8px; }}
      .small {{ font-size: 12px; color: #666; }}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>{escape(process.get("name", "Prozess"))}</h1>
      <h2>{escape(output_part.name)}</h2>
      <div class="bom">
        <div class="plus">+1x {escape(output_part.name)}</div>
        {"".join([f'<div class="minus">-{escape(line["quantity"])}x {escape(line["part_name"])}</div>' for line in bom_lines])}
      </div>
      <div class="field">
        <label for="run-n">Anzahl</label>
        <input id="run-n" type="number" min="1" step="1" value="1" />
      </div>
      <button id="run-btn">Ausführen</button>
      <div id="result"></div>
    </div>
    <script>
      function getCookie(name) {{
        const value = `; ${{document.cookie}}`;
        const parts = value.split(`; ${{name}}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      }}

      const btn = document.getElementById('run-btn');
      const result = document.getElementById('result');
      btn.addEventListener('click', async () => {{
        const n = parseInt(document.getElementById('run-n').value, 10);
        if (Number.isNaN(n) || n < 1) {{
          result.innerHTML = '<div class="message error">Anzahl muss >= 1 sein.</div>';
          return;
        }}
        btn.disabled = true;
        result.innerHTML = '';
        const response = await fetch('/api/action/', {{
          method: 'POST',
          headers: {{
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') || ''
          }},
          body: JSON.stringify({{
            action: 'processes',
            data: {{ method: 'run', id: {json.dumps(process_id)}, n }}
          }})
        }});
        const data = await response.json();
        btn.disabled = false;
        if (!data || !data.ok) {{
          result.innerHTML = `<div class="message error">${{data && data.error ? data.error : 'Fehler'}}</div>`;
          return;
        }}
        const consumed = (data.consumed || []).map(line =>
          `-${{line.qty}} (Part ${{line.part_id}}, Stock ${{line.stock_item_id}})`
        );
        const produced = data.produced ? `+${{data.produced.qty}} (Part ${{data.produced.part_id}}, Stock ${{data.produced.stock_item_id}})` : '';
        let html = `<div class="message success"><strong>Produziert:</strong><br/>${{produced}}`;
        if (consumed.length) {{
          html += `<br/><strong>Verbraucht:</strong><br/>${{consumed.join('<br/>')}}`;
        }}
        html += '</div>';
        if ((data.warnings || []).includes('created_new_stockitem')) {{
          html += '<div class="message warning">Neuer Stock erstellt - bitte Label drucken</div>';
        }}
        result.innerHTML = html;
      }});
    </script>
  </body>
</html>
"""
        return HttpResponse(html)
