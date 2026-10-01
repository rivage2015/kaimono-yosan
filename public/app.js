'use strict';
const KEY='shopping-budget-memo-v1',MAX=Number.MAX_SAFE_INTEGER;
const $=id=>document.getElementById(id),yen=n=>n.toLocaleString('ja-JP')+'円';
function integer(value,min=0){if(!/^[0-9]+$/.test(String(value)))throw Error('半角の整数で入力してください。');const n=Number(value);if(!Number.isSafeInteger(n)||n<min)throw Error(min?'数量は1以上の安全な整数で入力してください。':'金額が大きすぎます。安全な整数で入力してください。');return n;}
function sum(items){return items.reduce((s,i)=>{const n=i.price*i.quantity;if(!Number.isSafeInteger(n)||!Number.isSafeInteger(s+n))throw Error('合計が大きすぎます。価格や数量を小さくしてください。');return s+n;},0);}
let state={budget:3000,items:[]},quantity=1,editing=null,deleted=null,undoTimer;
try{const raw=localStorage.getItem(KEY);if(raw){const data=JSON.parse(raw);integer(data.budget);if(!Array.isArray(data.items))throw Error();const ids=new Set();data.items.forEach(i=>{if(typeof i.id!=='string'||ids.has(i.id)||typeof i.name!=='string'||i.name.length>80)throw Error();ids.add(i.id);integer(i.price);integer(i.quantity,1)});sum(data.items);state=data;}}catch(e){$('storage-status').textContent='保存内容を読み込めませんでした。新しい内容を保存するまでは元の保存内容を保持します。';}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('storage-status').textContent='';}catch(e){$('storage-status').textContent='端末への保存に失敗しました。今の内容は画面にありますが、閉じると失われる可能性があります。';}}
function render(){const total=sum(state.items),left=state.budget-total;$('total').textContent=yen(total);$('remaining').textContent=left<0?'予算超過 '+yen(-left):'残予算 '+yen(left);document.querySelector('.summary').classList.toggle('over',left<0);$('budget-label').textContent=yen(state.budget);$('count').textContent=state.items.length+'件';$('empty').hidden=state.items.length>0;$('list').replaceChildren();state.items.forEach((item,index)=>{const li=document.createElement('li'),name=document.createElement('div'),detail=document.createElement('p'),bottom=document.createElement('div'),amount=document.createElement('strong');name.className='item-name';name.textContent=item.name||'商品 '+(index+1);detail.className='item-detail';detail.textContent=yen(item.price)+' × '+item.quantity;bottom.className='item-bottom';amount.textContent=yen(item.price*item.quantity);bottom.append(amount);[['編集',()=>edit(item)],['削除',()=>remove(item)]].forEach(([label,action])=>{const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-label',name.textContent+'を'+label);b.onclick=action;bottom.append(b)});li.append(name,detail,bottom);$('list').append(li)});}
function commit(items){sum(items);state.items=items;save();render();}
// テンキーはフォーム内に展開する。端末標準入力と同時表示しない。
let inputMode='pad';
const touchInput=matchMedia('(pointer: coarse)').matches;
function closePad(){ $('keypad').hidden=true; $('input-toggle').textContent='大きなテンキーを開く'; }
function openPad(){inputMode='pad';$('price').inputMode=touchInput?'none':'numeric';$('price').readOnly=touchInput;if(touchInput)$('price').blur();$('keypad').hidden=false;$('input-toggle').textContent='テンキーを閉じる';$('input-help').textContent='数字を押して入力。確定するとテンキーを閉じます。';}
function useKeyboard(){inputMode='keyboard';closePad();$('price').readOnly=false;$('price').inputMode='text';$('input-help').textContent='端末のキーボードで入力。種類やフリック入力は端末の設定によります。';$('price').focus();}
if(touchInput){$('price').readOnly=true;$('price').inputMode='none';}
$('price').addEventListener('click',()=>{if(inputMode==='pad')openPad()});
$('input-toggle').onclick=()=>{if($('keypad').hidden)openPad();else closePad()};
$('keypad-close').onclick=closePad;$('keypad-done').onclick=closePad;$('keyboard-switch').onclick=useKeyboard;
document.querySelectorAll('[data-digit]').forEach(b=>b.onclick=()=>{const p=$('price');const start=p.selectionStart??p.value.length,end=p.selectionEnd??start;p.value=p.value.slice(0,start)+b.dataset.digit+p.value.slice(end);p.setSelectionRange(start+1,start+1);$('form-error').textContent='';});
$('keypad-backspace').onclick=()=>{const p=$('price'),start=p.selectionStart??p.value.length,end=p.selectionEnd??start;const cut=start===end?Math.max(0,start-1):start;p.value=p.value.slice(0,cut)+p.value.slice(end);p.setSelectionRange(cut,cut);};
document.addEventListener('click',e=>{if(!$('keypad').contains(e.target)&&e.target!==$('price')&&e.target!==$('input-toggle'))closePad()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePad()});
$('minus').onclick=()=>{$('quantity').textContent=quantity=Math.max(1,quantity-1)};
$('plus').onclick=()=>{if(quantity<MAX)$('quantity').textContent=++quantity};
$('add-form').onsubmit=e=>{e.preventDefault();try{const price=integer($('price').value),item={id:crypto.randomUUID(),name:$('name').value.trim(),price,quantity};commit([...state.items,item]);$('price').value='';$('name').value='';$('quantity').textContent=quantity=1;$('form-error').textContent='';$('price').focus();}catch(err){$('form-error').textContent=err.message;}};
function edit(item){editing=item.id;$('edit-name').value=item.name;$('edit-price').value=item.price;$('edit-quantity').value=item.quantity;$('edit-error').textContent='';$('editor').showModal();}
$('edit-form').onsubmit=e=>{e.preventDefault();try{const replacement={id:editing,name:$('edit-name').value.trim(),price:integer($('edit-price').value),quantity:integer($('edit-quantity').value,1)};commit(state.items.map(i=>i.id===editing?replacement:i));$('editor').close();}catch(err){$('edit-error').textContent=err.message;}};
function remove(item){deleted={item,index:state.items.findIndex(i=>i.id===item.id)};commit(state.items.filter(i=>i.id!==item.id));clearTimeout(undoTimer);$('undo-box').hidden=false;undoTimer=setTimeout(()=>{deleted=null;$('undo-box').hidden=true},8000);}
$('undo').onclick=()=>{if(!deleted)return;try{const items=[...state.items];items.splice(deleted.index,0,deleted.item);commit(items);deleted=null;clearTimeout(undoTimer);$('undo-box').hidden=true;}catch(err){$('storage-status').textContent='取り消せません：'+err.message;}};
$('budget-open').onclick=()=>{$('budget-input').value=state.budget;$('budget-error').textContent='';$('budget-dialog').showModal()};
$('budget-form').onsubmit=e=>{e.preventDefault();try{state.budget=integer($('budget-input').value);save();render();$('budget-dialog').close()}catch(err){$('budget-error').textContent=err.message}};
$('finish').onclick=()=>$('finish-dialog').showModal();$('finish-confirm').onclick=()=>{commit([]);deleted=null;clearTimeout(undoTimer);$('undo-box').hidden=true;$('finish-dialog').close();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());render();
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async reg=>{await navigator.serviceWorker.ready;const updateStatus=()=>{$('offline-status').textContent=reg.waiting?'更新があります。買い物後に画面をすべて閉じて開くと反映されます。':'オフラインで使えます。'};updateStatus();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')updateStatus()})});}).catch(()=>{$('offline-status').textContent='オフライン準備に失敗しました。通信できる場所で再度開いてください。'});}else{$('offline-status').textContent='この環境ではオフラインに対応していません。';}
