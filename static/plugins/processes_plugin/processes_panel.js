// Processes Plugin UI Panel

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function postAction(payload) {
  const response = await fetch('/api/action/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken') || '',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

function ensureModalContainer(target) {
  let container = target.querySelector('.processes-plugin-modals');
  if (!container) {
    container = document.createElement('div');
    container.className = 'processes-plugin-modals';
    target.appendChild(container);
  }
  return container;
}

function ensureAlertContainer(target) {
  let container = target.querySelector('.processes-plugin-alerts');
  if (!container) {
    container = document.createElement('div');
    container.className = 'processes-plugin-alerts mb-3';
    target.prepend(container);
  }
  return container;
}

function showAlert(target, html, level = 'info') {
  const container = ensureAlertContainer(target);
  const alert = document.createElement('div');
  alert.className = `alert alert-${level} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
    ${html}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  container.appendChild(alert);
}

function getQrLibSource() {
  // Minimal QRCode generator (MIT) - inlined to avoid external dependencies.
  // Source: https://github.com/davidshimjs/qrcodejs (minified)
  return `(function(){var QRCode=function(e,t){this._el=e;this._htOption={width:128,height:128,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRErrorCorrectLevel.H};if("string"==typeof t&&0!=t.length)this._htOption.text=t;else if("object"==typeof t){for(var i in t)this._htOption[i]=t[i];this._htOption.text=t.text||""}this._oQRCode=null;this._oDrawing=null;this._android=0;this._el.title=\"\";this.makeCode(this._htOption.text)};QRCode.prototype.makeCode=function(e){this._oQRCode=new QRCodeModel(_getTypeNumber(e,this._htOption.correctLevel),this._htOption.correctLevel);this._oQRCode.addData(e);this._oQRCode.make();this._el.title=e;this._oDrawing=new Drawing(this._el,this._htOption);this._oDrawing.draw(this._oQRCode);this._oDrawing.makeImage()};QRCode.prototype.clear=function(){this._oDrawing&&this._oDrawing.clear()};QRCode.CorrectLevel=QRErrorCorrectLevel;var QRMode={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8};var QRErrorCorrectLevel={L:1,M:0,Q:3,H:2};var QRMaskPattern={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var QRUtil={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(e){for(var t=e<<10;QRUtil.getBCHDigit(t)-QRUtil.getBCHDigit(QRUtil.G15)>=0;)t^=QRUtil.G15<<(QRUtil.getBCHDigit(t)-QRUtil.getBCHDigit(QRUtil.G15));return(e<<10|t)^QRUtil.G15_MASK},getBCHTypeNumber:function(e){for(var t=e<<12;QRUtil.getBCHDigit(t)-QRUtil.getBCHDigit(QRUtil.G18)>=0;)t^=QRUtil.G18<<(QRUtil.getBCHDigit(t)-QRUtil.getBCHDigit(QRUtil.G18));return e<<12|t},getBCHDigit:function(e){for(var t=0;0!=e;)t++,e>>=1;return t},getPatternPosition:function(e){return QRUtil.PATTERN_POSITION_TABLE[e-1]},getMask:function(e,t,i){switch(e){case QRMaskPattern.PATTERN000:return(t+i)%2==0;case QRMaskPattern.PATTERN001:return t%2==0;case QRMaskPattern.PATTERN010:return i%3==0;case QRMaskPattern.PATTERN011:return(t+i)%3==0;case QRMaskPattern.PATTERN100:return(Math.floor(t/2)+Math.floor(i/3))%2==0;case QRMaskPattern.PATTERN101:return t*i%2+t*i%3==0;case QRMaskPattern.PATTERN110:return(t*i%2+t*i%3)%2==0;case QRMaskPattern.PATTERN111:return(t*i%3+(t+i)%2)%2==0;default:throw new Error("bad maskPattern: "+e)}},getErrorCorrectPolynomial:function(e){for(var t=new QRPolynomial([1],0),i=0;i<e;i++)t=t.multiply(new QRPolynomial([1,QRMath.gexp(i)],0));return t},getLengthInBits:function(e,t){if(t>=1&&t<10)switch(e){case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:return 8;case QRMode.MODE_KANJI:return 8;default:throw new Error("mode:"+e)}else if(t<27)switch(e){case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw new Error("mode:"+e)}else{if(!(t<41))throw new Error("type:"+t);switch(e){case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw new Error("mode:"+e)}}},getLostPoint:function(e){for(var t=e.getModuleCount(),i=0,r=0;r<t;r++)for(var n=0;n<t;n++){for(var o=0,s=e.isDark(r,n),a=-1;a<=1;a++)if(!(r+a<0||t<=r+a))for(var h=-1;h<=1;h++)n+h<0||t<=n+h||(0==a&&0==h||s!=e.isDark(r+a,n+h)||(o++));o>5&&(i+=3+o-5)}for(r=0;r<t-1;r++)for(n=0;n<t-1;n++){var u=0;e.isDark(r,n)&&u++;e.isDark(r+1,n)&&u++;e.isDark(r,n+1)&&u++;e.isDark(r+1,n+1)&&u++;(0==u||4==u)&&(i+=3)}for(r=0;r<t;r++)for(n=0;n<t-6;n++)e.isDark(r,n)&&!e.isDark(r,n+1)&&e.isDark(r,n+2)&&e.isDark(r,n+3)&&e.isDark(r,n+4)&&!e.isDark(r,n+5)&&e.isDark(r,n+6)&&(i+=40);for(n=0;n<t;n++)for(r=0;r<t-6;r++)e.isDark(r,n)&&!e.isDark(r+1,n)&&e.isDark(r+2,n)&&e.isDark(r+3,n)&&e.isDark(r+4,n)&&!e.isDark(r+5,n)&&e.isDark(r+6,n)&&(i+=40);var l=0;for(n=0;n<t;n++)for(r=0;r<t;r++)e.isDark(r,n)&&l++;return i+=10*Math.abs(100*l/t/t-50)},};var QRMath={glog:function(e){if(e<1)throw new Error("glog("+e+")");return QRMath.LOG_TABLE[e]},gexp:function(e){for(;e<0;)e+=255;for(;e>=256;)e-=255;return QRMath.EXP_TABLE[e]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)};for(var i=0;i<8;i++)QRMath.EXP_TABLE[i]=1<<i;for(i=8;i<256;i++)QRMath.EXP_TABLE[i]=QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];for(i=0;i<255;i++)QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]]=i;var QRPolynomial=function(e,t){if(void 0==e.length)throw new Error(e.length+"/"+t);for(var i=0;i<e.length&&0==e[i];)i++;this.num=new Array(e.length-i+t);for(var r=0;r<e.length-i;r++)this.num[r]=e[r+i]};QRPolynomial.prototype={get:function(e){return this.num[e]},getLength:function(){return this.num.length},multiply:function(e){for(var t=new Array(this.getLength()+e.getLength()-1),i=0;i<this.getLength();i++)for(var r=0;r<e.getLength();r++)t[i+r]^=QRMath.gexp(QRMath.glog(this.get(i))+QRMath.glog(e.get(r)));return new QRPolynomial(t,0)},mod:function(e){if(this.getLength()-e.getLength()<0)return this;for(var t=QRMath.glog(this.get(0))-QRMath.glog(e.get(0)),i=new Array(this.getLength()),r=0;r<this.getLength();r++)i[r]=this.get(r);for(r=0;r<e.getLength();r++)i[r]^=QRMath.gexp(QRMath.glog(e.get(r))+t);return(new QRPolynomial(i,0)).mod(e)}};var QRRSBlock=function(e,t){this.totalCount=e,this.dataCount=t};QRRSBlock.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,19,10,44,20],[4,144,116,4,145,117],[17,68,42],[17,50,22,4,51,23],[2,44,14,19,45,15],[6,151,121,2,152,122],[17,69,43,1,70,44],[7,54,24,16,55,25],[34,37,13,6,38,14],[8,152,122,4,153,123],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[10,147,117,2,148,118],[6,73,45,14,74,46],[29,54,24,2,55,25],[6,46,16,30,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[4,148,118,4,149,119],[3,74,46,23,75,47],[21,54,24,12,55,25],[22,45,15,13,46,16],[10,142,114,1,143,115],[10,74,46,7,75,47],[23,54,24,10,55,25],[67,46,16,0,0,0],[8,152,122,4,153,123],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[4,148,118,4,149,119],[3,74,46,23,75,47],[21,54,24,12,55,25],[22,45,15,13,46,16]],getRSBlocks:function(e,t){var i=QRRSBlock.RS_BLOCK_TABLE[4*(e-1)+t];if(void 0==i)throw new Error("bad rs block @ typeNumber:"+e+"/errorCorrectLevel:"+t);for(var r=0,n=0;n<i.length/3;n++){for(var o=i[3*n+0],s=i[3*n+1],a=i[3*n+2],h=0;h<a;h++)r++;for(h=0;h<a;h++)r++}for(var u=new Array(r),l=0,c=0;n=0;n<i.length/3;n++){for(o=i[3*n+0],s=i[3*n+1],a=i[3*n+2],h=0;h<a;h++)u[c++]=new QRRSBlock(o,s);for(h=0;h<a;h++)u[c++]=new QRRSBlock(o,s+a)}return u}};var QRBitBuffer=function(){this.buffer=[],this.length=0};QRBitBuffer.prototype={get:function(e){var t=Math.floor(e/8);return 1==(this.buffer[t]>>>7-e%8&1)},put:function(e,t){for(var i=0;i<t;i++)this.putBit(1==(e>>>t-i-1&1))},putBit:function(e){var t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0);e&&(this.buffer[t]|=128>>>this.length%8);this.length++}};var QRCodeModel=function(e,t){this.typeNumber=e;this.errorCorrectLevel=t;this.modules=null;this.moduleCount=0;this.dataCache=null;this.dataList=[]};QRCodeModel.prototype={addData:function(e){var t=new QR8bitByte(e);this.dataList.push(t);this.dataCache=null},isDark:function(e,t){if(e<0||this.moduleCount<=e||t<0||this.moduleCount<=t)throw new Error(e+","+t);return this.modules[e][t]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(e,t){this.moduleCount=4*this.typeNumber+17;this.modules=new Array(this.moduleCount);for(var i=0;i<this.moduleCount;i++){this.modules[i]=new Array(this.moduleCount);for(var r=0;r<this.moduleCount;r++)this.modules[i][r]=null}this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(e,t);this.typeNumber>=7&&this.setupTypeNumber(e);null==this.dataCache&&(this.dataCache=QRCodeModel.createData(this.typeNumber,this.errorCorrectLevel,this.dataList));this.mapData(this.dataCache,t)},setupPositionProbePattern:function(e,t){for(var i=-1;i<=7;i++)if(!(e+i<=-1||this.moduleCount<=e+i))for(var r=-1;r<=7;r++)t+r<=-1||this.moduleCount<=t+r||(0<=i&&i<=6&&0<=r&&r<=6&&(0==i||6==i||0==r||6==r||2<=i&&i<=4&&2<=r&&r<=4)?this.modules[e+i][t+r]=!0:this.modules[e+i][t+r]=!1)},getBestMaskPattern:function(){for(var e=0,t=0,i=0;i<8;i++){this.makeImpl(!0,i);var r=QRUtil.getLostPoint(this);(0==i||e>r)&&(e=r,t=i)}return t},createMovieClip:function(){return null},setupTimingPattern:function(){for(var e=8;e<this.moduleCount-8;e++)null==this.modules[e][6]&&(this.modules[e][6]=e%2==0);for(var t=8;t<this.moduleCount-8;t++)null==this.modules[6][t]&&(this.modules[6][t]=t%2==0)},setupPositionAdjustPattern:function(){for(var e=QRUtil.getPatternPosition(this.typeNumber),t=0;t<e.length;t++)for(var i=0;i<e.length;i++){var r=e[t],n=e[i];if(null==this.modules[r][n])for(var o=-2;o<=2;o++)for(var s=-2;s<=2;s++)this.modules[r+o][n+s]=-2==o||2==o||-2==s||2==s||0==o&&0==s?!0:!1}},setupTypeNumber:function(e){for(var t=QRUtil.getBCHTypeNumber(this.typeNumber),i=0;i<18;i++){var r=!e&&1==(t>>i&1);this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=r}for(i=0;i<18;i++){r=!e&&1==(t>>i&1);this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=r}},setupTypeInfo:function(e,t){for(var i=QRUtil.getBCHTypeInfo(t),r=0;r<15;r++){var n=!e&&1==(i>>r&1);r<6?this.modules[r][8]=n:r<8?this.modules[r+1][8]=n:this.modules[this.moduleCount-15+r][8]=n}for(r=0;r<15;r++){n=!e&&1==(i>>r&1);r<8?this.modules[8][this.moduleCount-r-1]=n:r<9?this.modules[8][15-r-1+1]=n:this.modules[8][15-r-1]=n}this.modules[this.moduleCount-8][8]=!e},mapData:function(e,t){for(var i=-1,r=this.moduleCount-1,n=7,o=0,s=this.moduleCount-1;s>0;s-=2)for(6==s&&s--;;){for(var a=0;a<2;a++)if(null==this.modules[r][s-a]){var h=!1;o<e.length&&(h=1==(e[o]>>>n&1));var u=QRUtil.getMask(t,r,s-a);u&&(h=!h);this.modules[r][s-a]=h}if(0==n)o++,n=7;else n--;if((r+=i)<0||this.moduleCount<=r){r-=i;i=-i;break}}}};QRCodeModel.PAD0=236;QRCodeModel.PAD1=17;QRCodeModel.createData=function(e,t,i){for(var r=QRRSBlock.getRSBlocks(e,t),n=new QRBitBuffer,o=0;o<i.length;o++){var s=i[o];n.put(s.mode,4);n.put(s.getLength(),QRUtil.getLengthInBits(s.mode,e));s.write(n)}for(var a=0,h=0;h<r.length;h++)a+=r[h].dataCount;if(n.length+4<=8*a)n.put(0,4);for(;n.length%8!=0;)n.putBit(!1);for(;!(n.length>=8*a);){n.put(QRCodeModel.PAD0,8);if(n.length>=8*a)break;n.put(QRCodeModel.PAD1,8)}return QRCodeModel.createBytes(n,r)};QRCodeModel.createBytes=function(e,t){for(var i=0,r=0,n=0,o=new Array(t.length),s=new Array(t.length),a=0;a<t.length;a++){var h=t[a].dataCount,u=t[a].totalCount-h;r=Math.max(r,h),n=Math.max(n,u);o[a]=new Array(h);for(var l=0;l<o[a].length;l++)o[a][l]=255&e.buffer[l+a*h];var c=QRUtil.getErrorCorrectPolynomial(u),d=new QRPolynomial(o[a],c.getLength()-1).mod(c);s[a]=new Array(c.getLength()-1);for(l=0;l<s[a].length;l++){var f=l+d.getLength()-s[a].length;s[a][l]=f>=0?d.get(f):0}}var p=0;for(l=0;l<r;l++)for(a=0;a<t.length;a++)l<o[a].length&&(e.buffer[p++]=o[a][l]);for(l=0;l<n;l++)for(a=0;a<t.length;a++)l<s[a].length&&(e.buffer[p++]=s[a][l]);return e.buffer};var QR8bitByte=function(e){this.mode=QRMode.MODE_8BIT_BYTE;this.data=e};QR8bitByte.prototype={getLength:function(){return this.data.length},write:function(e){for(var t=0;t<this.data.length;t++)e.put(this.data.charCodeAt(t),8)}};function _getTypeNumber(e,t){for(var i=1;i<41;i++){for(var r=QRRSBlock.getRSBlocks(i,t),n=new QRBitBuffer,o=0;o<r.length;o++)n.put(0,r[o].dataCount*8);if(n.length>=e.length*8+4)return i}return 1}var Drawing=function(e,t){this._el=e;this._htOption=t;this._oQRCode=null;this._el.innerHTML=\"\"};Drawing.prototype={draw:function(e){this._oQRCode=e;var t=this._htOption.width,i=this._htOption.height,r=e.getModuleCount(),n=t/r,o=i/r,s=Math.floor(n),a=Math.floor(o),h=document.createElement(\"table\");h.style.border=\"0\";h.style.borderCollapse=\"collapse\";h.style.backgroundColor=this._htOption.colorLight;h.style.width=t+\"px\";h.style.height=i+\"px\";var u=document.createElement(\"tbody\");for(var l=0;l<r;l++){var c=document.createElement(\"tr\");c.style.height=a+\"px\";for(var d=0;d<r;d++){var f=document.createElement(\"td\");f.style.width=s+\"px\";f.style.backgroundColor=e.isDark(l,d)?this._htOption.colorDark:this._htOption.colorLight;c.appendChild(f)}u.appendChild(c)}h.appendChild(u);this._el.innerHTML=\"\";this._el.appendChild(h)},makeImage:function(){}};window.QRCode=QRCode;window.QRCodeModel=QRCodeModel;window.QRErrorCorrectLevel=QRErrorCorrectLevel;})();`;
}

function createModal({ id, title, bodyHtml, primaryLabel }) {
  return `
    <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${bodyHtml}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" data-primary>${primaryLabel}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function showModal(modalEl) {
  if (window.bootstrap && window.bootstrap.Modal) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    return modal;
  }
  modalEl.classList.add('show');
  modalEl.style.display = 'block';
  return null;
}

function hideModal(modalEl) {
  if (window.bootstrap && window.bootstrap.Modal) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
    return;
  }
  modalEl.classList.remove('show');
  modalEl.style.display = 'none';
}

export function renderPanel(target, context) {
  target.innerHTML = '';

  ensureAlertContainer(target);

  const header = document.createElement('div');
  header.className = 'd-flex justify-content-between align-items-center mb-3';
  header.innerHTML = `
    <h5 class="mb-0">Prozesse</h5>
    <button class="btn btn-sm btn-primary" data-create>+</button>
  `;
  target.appendChild(header);

  const tableWrap = document.createElement('div');
  tableWrap.className = 'table-responsive';
  tableWrap.innerHTML = `
    <table class="table table-sm table-striped">
      <thead>
        <tr>
          <th>Name</th>
          <th>Output-Part</th>
          <th class="text-end">Aktionen</th>
        </tr>
      </thead>
      <tbody data-rows></tbody>
    </table>
  `;
  target.appendChild(tableWrap);

  const modals = ensureModalContainer(target);
  modals.innerHTML = createModal({
    id: 'processes-create-modal',
    title: 'Prozess erstellen',
    primaryLabel: 'Speichern',
    bodyHtml: `
      <div class="mb-3">
        <label class="form-label">Name</label>
        <input class="form-control" name="name" />
      </div>
      <div class="mb-3">
        <label class="form-label">Output Part</label>
        <input class="form-control" name="output_part_search" placeholder="Suche Part..." />
        <input type="hidden" name="output_part_id" />
        <div class="list-group mt-2" data-part-results></div>
      </div>
      <div class="mb-3">
        <label class="form-label">BOM Vorschau</label>
        <div class="border rounded p-2 small bg-light" data-bom-preview>
          <span class="text-muted">Kein Output Part gewählt.</span>
        </div>
      </div>
    `,
  }) + createModal({
    id: 'processes-run-modal',
    title: 'Prozess ausführen',
    primaryLabel: 'Abrechnen',
    bodyHtml: `
      <div class="mb-2">
        <strong data-run-name></strong>
      </div>
      <div class="mb-3">
        <label class="form-label">Anzahl</label>
        <input class="form-control" name="n" type="number" min="1" step="1" value="1" />
      </div>
      <div class="mb-3">
        <label class="form-label">BOM Übersicht</label>
        <div class="border rounded p-2 small bg-light" data-run-bom-preview>
          <span class="text-muted">Keine Vorschau verfügbar.</span>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">Notiz (optional)</label>
        <textarea class="form-control" name="note" rows="2"></textarea>
      </div>
    `,
  });

  const rowsEl = tableWrap.querySelector('[data-rows]');
  const createBtn = header.querySelector('[data-create]');
  const createModalEl = modals.querySelector('#processes-create-modal');
  const runModalEl = modals.querySelector('#processes-run-modal');

  let processes = [];
  let editingProcess = null;
  let runningProcess = null;
  let selectedPart = null;

  function renderRows() {
    rowsEl.innerHTML = '';
    if (!processes.length) {
      rowsEl.innerHTML = '<tr><td colspan="3" class="text-muted">Keine Prozesse vorhanden.</td></tr>';
      return;
    }

    processes.forEach((process) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${process.name || ''}</td>
        <td>${process.output_part_id || ''}</td>
        <td class="text-end">
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-success" data-run>Ausführen</button>
            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" data-edit>Edit</a></li>
              <li><a class="dropdown-item" href="#" data-duplicate>Duplicate</a></li>
              <li><a class="dropdown-item" href="#" data-delete>Delete</a></li>
              <li><a class="dropdown-item" href="#" data-print>Print Label</a></li>
            </ul>
          </div>
        </td>
      `;

      row.querySelector('[data-run]').addEventListener('click', () => {
        runningProcess = process;
        runModalEl.querySelector('[data-run-name]').textContent = process.name || 'Prozess';
        runModalEl.querySelector('[name="n"]').value = 1;
        runModalEl.querySelector('[name="note"]').value = '';
        loadRunBomPreview(process);
        showModal(runModalEl);
      });

      row.querySelector('[data-edit]').addEventListener('click', (event) => {
        event.preventDefault();
        editingProcess = process;
        createModalEl.querySelector('.modal-title').textContent = 'Prozess bearbeiten';
        createModalEl.querySelector('[name="name"]').value = process.name || '';
        createModalEl.querySelector('[name="output_part_id"]').value = process.output_part_id || '';
        createModalEl.querySelector('[name="output_part_search"]').value = process.output_part_id || '';
        clearPartResults();
        loadBomPreview(null);
        showModal(createModalEl);
        hydrateEditPart(process);
      });

      row.querySelector('[data-duplicate]').addEventListener('click', async (event) => {
        event.preventDefault();
        await postAction({ action: 'processes', data: { method: 'duplicate', id: process.id } });
        await reload();
      });

      row.querySelector('[data-delete]').addEventListener('click', async (event) => {
        event.preventDefault();
        if (!confirm('Prozess löschen?')) return;
        await postAction({ action: 'processes', data: { method: 'delete', id: process.id } });
        await reload();
      });

      row.querySelector('[data-print]').addEventListener('click', (event) => {
        event.preventDefault();
        printLabel(process);
      });

      rowsEl.appendChild(row);
    });
  }

  async function fetchParts(query) {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    params.append('has_bom', 'true');

    let response = await fetch(`/api/part/?${params.toString()}`);
    if (!response.ok) {
      response = await fetch(`/api/part/?search=${encodeURIComponent(query || '')}`);
    }
    const data = await response.json();
    return data.results || [];
  }

  async function fetchPartById(partId) {
    const response = await fetch(`/api/part/${partId}/`);
    if (!response.ok) return null;
    return response.json();
  }

  async function printLabel(process) {
    const part = process.output_part_id ? await fetchPartById(process.output_part_id) : null;
    const processName = process.name || 'Prozess';
    const outputName = part ? part.name : '';
    const qrValue = `PROC:${process.id}`;
    const runUrl = `${window.location.origin}/plugins/processes_plugin/run/${process.id}/`;

    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Prozess Label</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            .title { font-size: 28px; font-weight: 700; margin-bottom: 12px; }
            .subtitle { font-size: 16px; margin-bottom: 16px; color: #444; }
            .qr { margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="title">${processName}</div>
          ${outputName ? `<div class="subtitle">${outputName}</div>` : ''}
          <div id="qr" class="qr"></div>
          <div class="subtitle">${runUrl}</div>
          <script>${getQrLibSource()}</script>
          <script>
            new QRCode(document.getElementById('qr'), { text: ${JSON.stringify(
              qrValue
            )}, width: 200, height: 200 });
            setTimeout(function() { window.print(); }, 300);
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  async function loadBomPreview(part) {
    const previewEl = createModalEl.querySelector('[data-bom-preview]');
    if (!part || !part.pk) {
      previewEl.innerHTML = '<span class="text-muted">Kein Output Part gewählt.</span>';
      return;
    }

    const result = await postAction({
      action: 'processes',
      data: { method: 'bom_preview', output_part_id: part.pk },
    });

    if (!result || !result.ok) {
      previewEl.innerHTML = '<span class="text-danger">BOM Vorschau nicht verfügbar.</span>';
      return;
    }

    const lines = result.bom || [];
    const items = [];
    items.push(`<div class="text-success">+1x ${part.name}</div>`);
    lines.forEach((line) => {
      items.push(`<div class="text-danger">-${line.quantity}x ${line.part_name || ''}</div>`);
    });
    previewEl.innerHTML = items.join('') || '<span class="text-muted">Keine BOM Positionen.</span>';
  }

  async function loadRunBomPreview(process) {
    const previewEl = runModalEl.querySelector('[data-run-bom-preview]');
    if (!process || !process.output_part_id) {
      previewEl.innerHTML = '<span class="text-muted">Keine Vorschau verfügbar.</span>';
      return;
    }
    const part = await fetchPartById(process.output_part_id);
    if (!part) {
      previewEl.innerHTML = '<span class="text-muted">Keine Vorschau verfügbar.</span>';
      return;
    }
    const result = await postAction({
      action: 'processes',
      data: { method: 'bom_preview', output_part_id: part.pk },
    });
    if (!result || !result.ok) {
      previewEl.innerHTML = '<span class="text-danger">BOM Vorschau nicht verfügbar.</span>';
      return;
    }
    const lines = result.bom || [];
    const items = [];
    items.push(`<div class="text-success">+1x ${part.name}</div>`);
    lines.forEach((line) => {
      items.push(`<div class="text-danger">-${line.quantity}x ${line.part_name || ''}</div>`);
    });
    previewEl.innerHTML = items.join('') || '<span class="text-muted">Keine BOM Positionen.</span>';
  }

  function setSelectedPart(part) {
    selectedPart = part;
    createModalEl.querySelector('[name="output_part_id"]').value = part ? part.pk : '';
    createModalEl.querySelector('[name="output_part_search"]').value = part ? part.name : '';
    loadBomPreview(part);
  }

  function clearPartResults() {
    const list = createModalEl.querySelector('[data-part-results]');
    list.innerHTML = '';
  }

  function showPartResults(parts) {
    const list = createModalEl.querySelector('[data-part-results]');
    list.innerHTML = '';
    if (!parts.length) {
      list.innerHTML = '<div class="list-group-item text-muted">Keine Treffer</div>';
      return;
    }
    parts.forEach((part) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'list-group-item list-group-item-action';
      item.textContent = `${part.name} (ID ${part.pk})`;
      item.addEventListener('click', () => {
        setSelectedPart(part);
        clearPartResults();
      });
      list.appendChild(item);
    });
  }

  async function reload() {
    const result = await postAction({ action: 'processes', data: { method: 'list' } });
    if (result && result.ok) {
      processes = result.processes || [];
      renderRows();
    }
  }

  createBtn.addEventListener('click', () => {
    editingProcess = null;
    selectedPart = null;
    createModalEl.querySelector('.modal-title').textContent = 'Prozess erstellen';
    createModalEl.querySelector('[name="name"]').value = '';
    createModalEl.querySelector('[name="output_part_id"]').value = '';
    createModalEl.querySelector('[name="output_part_search"]').value = '';
    clearPartResults();
    loadBomPreview(null);
    showModal(createModalEl);
  });

  createModalEl.querySelector('[data-primary]').addEventListener('click', async () => {
    const name = createModalEl.querySelector('[name="name"]').value.trim();
    const outputPartId = parseInt(createModalEl.querySelector('[name="output_part_id"]').value, 10);
    if (!name || Number.isNaN(outputPartId)) {
      alert('Name und Output Part ID sind erforderlich.');
      return;
    }

    if (editingProcess) {
      await postAction({
        action: 'processes',
        data: { method: 'update', id: editingProcess.id, name, output_part_id: outputPartId },
      });
    } else {
      await postAction({
        action: 'processes',
        data: { method: 'create', name, output_part_id: outputPartId },
      });
    }

    hideModal(createModalEl);
    await reload();
  });

  runModalEl.querySelector('[data-primary]').addEventListener('click', async () => {
    const n = parseInt(runModalEl.querySelector('[name="n"]').value, 10);
    const note = runModalEl.querySelector('[name="note"]').value.trim();
    if (!runningProcess) return;

    if (Number.isNaN(n) || n < 1) {
      alert('Anzahl muss >= 1 sein.');
      return;
    }

    const result = await postAction({
      action: 'processes',
      data: { method: 'run', id: runningProcess.id, n, note: note || undefined },
    });

    hideModal(runModalEl);
    if (result && result.ok) {
      const consumed = (result.consumed || [])
        .map((line) => `-${line.qty} (Part ${line.part_id}, Stock ${line.stock_item_id})`)
        .join('<br/>');
      const produced = result.produced
        ? `+${result.produced.qty} (Part ${result.produced.part_id}, Stock ${result.produced.stock_item_id})`
        : '';
      let html = `<strong>Produziert:</strong><br/>${produced}`;
      if (consumed) {
        html += `<br/><strong>Verbraucht:</strong><br/>${consumed}`;
      }
      showAlert(target, html, 'success');
      if ((result.warnings || []).includes('created_new_stockitem')) {
        showAlert(
          target,
          'Neuer StockItem wurde erstellt – bitte Label drucken.',
          'warning'
        );
      }
    } else if (result && result.error) {
      showAlert(target, result.error, 'danger');
    }
    await reload();
  });

  createModalEl.querySelector('[name="output_part_search"]').addEventListener('input', async (event) => {
    const query = event.target.value.trim();
    selectedPart = null;
    createModalEl.querySelector('[name="output_part_id"]').value = '';
    if (query.length < 1) {
      clearPartResults();
      return;
    }
    const parts = await fetchParts(query);
    showPartResults(parts);
  });

  createModalEl.querySelector('[name="output_part_search"]').addEventListener('focus', async (event) => {
    const query = event.target.value.trim();
    if (query.length < 1) return;
    const parts = await fetchParts(query);
    showPartResults(parts);
  });

  createModalEl.querySelector('[name="output_part_search"]').addEventListener('blur', () => {
    setTimeout(clearPartResults, 200);
  });

  reload();

  async function hydrateEditPart(process) {
    if (!process || !process.output_part_id) {
      setSelectedPart(null);
      return;
    }
    const part = await fetchPartById(process.output_part_id);
    if (part) {
      setSelectedPart(part);
      return;
    }
    setSelectedPart(null);
  }
}
