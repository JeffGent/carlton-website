// LOCALE CONFIG
var LOCALE = (function(){
  var lang = document.documentElement.lang || 'nl';
  var locales = {
    nl: { months: ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'], days: ['Ma','Di','Wo','Do','Vr','Za','Zo'] },
    en: { months: ['January','February','March','April','May','June','July','August','September','October','November','December'], days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    fr: { months: ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'], days: ['Lu','Ma','Me','Je','Ve','Sa','Di'] },
    de: { months: ['Januar','Februar','Marz','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'], days: ['Mo','Di','Mi','Do','Fr','Sa','So'] }
  };
  return locales[lang] || locales.en;
})();

// SMOOTH SCROLL WITHOUT URL HASH
document.addEventListener('click',function(e){
var a=e.target.closest('a[href^="#"]');
if(!a||a.getAttribute('href')==='#')return;
var id=a.getAttribute('href').slice(1);
var el=document.getElementById(id);
if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});}
});

// NAV SCROLL
window.addEventListener('scroll',function(){
document.getElementById('nav').classList.toggle('scrolled',window.scrollY>60);
},{passive:true});

// DRAWER
var navToggle=document.getElementById('navToggle'),navDrawer=document.getElementById('navDrawer'),drawerOverlay=document.getElementById('drawerOverlay'),drawerClose=document.getElementById('drawerClose');
function openDrawer(){navDrawer.classList.add('open');drawerOverlay.classList.add('open')}
function closeDrawer(){navDrawer.classList.remove('open');drawerOverlay.classList.remove('open')}
navToggle.addEventListener('click',openDrawer);
drawerClose.addEventListener('click',closeDrawer);
drawerOverlay.addEventListener('click',closeDrawer);
document.querySelectorAll('.drawer-links a').forEach(function(a){a.addEventListener('click',closeDrawer)});

// ROOM SLIDES
function goToSlide(card,idx){
var slides=card.querySelector('.room-slides');
var total=slides.children.length;
if(idx<0)idx=0;if(idx>=total)idx=total-1;
card.setAttribute('data-slide',idx);
slides.style.transform='translateX(-'+idx*100+'%)';
card.querySelectorAll('.slide-dot').forEach(function(d,i){d.classList.toggle('active',i===idx)});
}
function slide(dot,idx){goToSlide(dot.closest('.room-card'),idx)}
function slideStep(arrow,dir){
var card=arrow.closest('.room-card');
var cur=parseInt(card.getAttribute('data-slide'))||0;
goToSlide(card,cur+dir);
}
// TOUCH
document.querySelectorAll('.room-card').forEach(function(card){
var sx;
card.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
card.addEventListener('touchend',function(e){
var dx=e.changedTouches[0].clientX-sx;
if(Math.abs(dx)>40){
var cur=parseInt(card.getAttribute('data-slide'))||0;
goToSlide(card,cur+(dx<0?1:-1));
}
},{passive:true});
});

// LIGHTBOX
(function(){
var lb,lbImg,lbCounter,imgs=[],cur=0;
function create(){
lb=document.createElement('div');lb.className='lightbox';
lbImg=document.createElement('img');
var prev=document.createElement('button');prev.className='lb-arrow lb-prev';prev.innerHTML='&#8249;';
var next=document.createElement('button');next.className='lb-arrow lb-next';next.innerHTML='&#8250;';
var close=document.createElement('button');close.className='lb-close';close.innerHTML='&times;';
lbCounter=document.createElement('div');lbCounter.className='lb-counter';
lb.appendChild(lbImg);lb.appendChild(prev);lb.appendChild(next);lb.appendChild(close);lb.appendChild(lbCounter);
document.body.appendChild(lb);
prev.addEventListener('click',function(e){e.stopPropagation();go(cur-1)});
next.addEventListener('click',function(e){e.stopPropagation();go(cur+1)});
close.addEventListener('click',closeLb);
lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
lbImg.addEventListener('click',function(e){e.stopPropagation();go(cur+1)});
document.addEventListener('keydown',function(e){
if(!lb.classList.contains('active'))return;
if(e.key==='Escape')closeLb();
if(e.key==='ArrowRight')go(cur+1);
if(e.key==='ArrowLeft')go(cur-1);
});
}
function go(idx){
if(idx<0)idx=imgs.length-1;if(idx>=imgs.length)idx=0;
cur=idx;
lbImg.src=imgs[cur];
lbCounter.textContent=(cur+1)+' / '+imgs.length;
}
function closeLb(){lb.classList.remove('active')}
function openLb(card,startIdx){
if(!lb)create();
imgs=[];
card.querySelectorAll('.room-slides img').forEach(function(img){imgs.push(img.src)});
cur=startIdx||parseInt(card.getAttribute('data-slide'))||0;
go(cur);
lb.classList.add('active');
}
document.querySelectorAll('.room-card').forEach(function(card){
card.querySelectorAll('.room-slides img').forEach(function(img){
img.style.cursor='zoom-in';
img.addEventListener('click',function(e){
e.stopPropagation();
openLb(card);
});
});
});
})();

// BREAKFAST SLIDES
var bfWrap=document.querySelector('.breakfast-img');
var bfIdx=0,bfTotal=document.querySelectorAll('.breakfast-slides img').length;
function bfGoTo(idx){
if(idx<0)idx=0;if(idx>=bfTotal)idx=bfTotal-1;
bfIdx=idx;
document.querySelector('.breakfast-slides').style.transform='translateX(-'+idx*100+'%)';
bfWrap.querySelectorAll('.slide-dot').forEach(function(d,i){d.classList.toggle('active',i===idx)});
}
function bfSlide(idx){bfGoTo(idx)}
function bfSlideStep(btn,dir){bfGoTo(bfIdx+dir)}
(function(){
var sx;
bfWrap.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
bfWrap.addEventListener('touchend',function(e){
var dx=e.changedTouches[0].clientX-sx;
if(Math.abs(dx)>40)bfGoTo(bfIdx+(dx<0?1:-1));
},{passive:true});
})();

// CALENDAR
function pad(n){return n<10?'0'+n:n}
function isoStr(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function fmtDisplay(d){return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()}
function nextDay(iso){var d=new Date(iso);d.setDate(d.getDate()+1);return isoStr(d)}
function closeAll(){document.querySelectorAll('.cal-popup').forEach(function(c){c.remove()})}
function buildCal(target,onPick,minDate){
closeAll();
var now=minDate||new Date();
var month=now.getMonth(),year=now.getFullYear();
var pop=document.createElement('div');pop.className='cal-popup';
function render(){
pop.innerHTML='';
var head=document.createElement('div');head.className='cal-head';
var prev=document.createElement('button');prev.textContent='\u2039';
prev.onclick=function(){month--;if(month<0){month=11;year--}render()};
var next=document.createElement('button');next.textContent='\u203A';
next.onclick=function(){month++;if(month>11){month=0;year++}render()};
var label=document.createElement('span');
label.textContent=LOCALE.months[month]+' '+year;
head.appendChild(prev);head.appendChild(label);head.appendChild(next);
pop.appendChild(head);
var grid=document.createElement('div');grid.className='cal-grid';
LOCALE.days.forEach(function(d){
var lbl=document.createElement('div');lbl.className='cal-day-label';lbl.textContent=d;grid.appendChild(lbl);
});
var first=new Date(year,month,1);
var startDay=(first.getDay()+6)%7;
var daysInMonth=new Date(year,month+1,0).getDate();
var today=new Date();today.setHours(0,0,0,0);
for(var i=0;i<startDay;i++){var empty=document.createElement('div');grid.appendChild(empty)}
for(var d=1;d<=daysInMonth;d++){
var cell=document.createElement('div');cell.className='cal-day';cell.textContent=d;
var dt=new Date(year,month,d);
if(dt<today){cell.classList.add('disabled')}else{
(function(dt){cell.onclick=function(){onPick(dt);closeAll()}})(dt);
}
grid.appendChild(cell);
}
pop.appendChild(grid);
}
render();
var rect=target.getBoundingClientRect();
pop.style.top=(rect.bottom+window.scrollY+4)+'px';
pop.style.left=rect.left+'px';
document.body.appendChild(pop);
return pop;
}
var bArr=document.getElementById('b-arrival'),bDep=document.getElementById('b-departure');
bArr.addEventListener('click',function(){
buildCal(bArr,function(d){
bArr.value=fmtDisplay(d);bArr.dataset.iso=isoStr(d);
bDep.value='';bDep.dataset.iso='';
setTimeout(function(){
buildCal(bDep,function(d2){bDep.value=fmtDisplay(d2);bDep.dataset.iso=isoStr(d2)},new Date(d.getTime()+86400000));
},100);
});
});
bDep.addEventListener('click',function(){
var min=bArr.dataset.iso?new Date(bArr.dataset.iso+'T00:00:00'):new Date();
min.setDate(min.getDate()+1);
buildCal(bDep,function(d){bDep.value=fmtDisplay(d);bDep.dataset.iso=isoStr(d)},min);
});
document.addEventListener('click',function(e){
if(!e.target.closest('.cal-popup')&&!e.target.closest('.b-date'))closeAll();
});

// BOOKING
window.goBook=function(el){
var base='https://bookingengine.mylighthouse.com/carlton-hotel-gent-gent/Rooms/Select?';
var arr=bArr.dataset.iso||'';
var dep=bDep.dataset.iso||'';
var coupon=document.getElementById('b-coupon').value.trim();
var params=[];
if(arr){var d=new Date(arr);params.push('Arrival='+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate());}
if(dep){var d2=new Date(dep);params.push('Departure='+d2.getFullYear()+'-'+(d2.getMonth()+1)+'-'+d2.getDate());}
params.push('Room=','Rate=','Package=');
if(coupon)params.push('DiscountCode='+encodeURIComponent(coupon));
el.href=base+params.join('&');
return true;
};

