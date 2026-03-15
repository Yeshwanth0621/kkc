import{n as e}from"./rolldown-runtime-DF2fYuay.js";import{c as t,t as n}from"./react-Dce5ql48.js";import{c as r,s as i}from"./constants-DzoHDdBQ.js";e(t(),1);var a=n();function o({children:e,className:t=``,hover:n=!1,glow:r=null,onClick:i}){return(0,a.jsxs)(`div`,{onClick:i,className:`
        relative overflow-hidden
        bg-card/80 backdrop-blur-xl
        border border-[rgba(0,240,255,0.06)] rounded-2xl p-5
        shadow-[0_0_1px_rgba(0,240,255,0.2),0_4px_24px_rgba(0,0,0,0.3)]
        transition-all duration-500 ease-out
        ${n?`
          hover:bg-card-hover/90
          hover:border-[rgba(0,240,255,0.2)]
          hover:shadow-[0_0_20px_rgba(0,240,255,0.15),0_8px_32px_rgba(0,0,0,0.4)]
          hover:-translate-y-1 hover:scale-[1.01]
          cursor-pointer group
        `:``}
        ${r&&{lime:`shadow-[0_0_20px_rgba(57,255,20,0.15)] border-[rgba(57,255,20,0.2)]`,cyan:`shadow-[0_0_20px_rgba(0,240,255,0.15)] border-[rgba(0,240,255,0.2)]`}[r]||``}
        ${i?`cursor-pointer`:``}
        ${t}
      `,children:[n&&(0,a.jsx)(`div`,{className:`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl overflow-hidden`,children:(0,a.jsx)(`div`,{className:`absolute inset-0`,style:{background:`repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.02) 2px, rgba(0, 240, 255, 0.02) 4px)`}})}),(0,a.jsx)(`div`,{className:`absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.3)] to-transparent`}),(0,a.jsx)(`div`,{className:`relative z-10`,children:e})]})}function s({children:e,color:t,className:n=``}){return(0,a.jsx)(`span`,{className:`
        inline-flex items-center gap-1.5 px-2.5 py-1
        text-[10px] font-mono font-bold uppercase tracking-widest
        rounded-lg border
        ${n}
      `,style:{color:t||`#e8e6f0`,borderColor:t?`${t}30`:`rgba(0, 240, 255, 0.15)`,backgroundColor:t?`${t}10`:`rgba(0, 240, 255, 0.05)`,textShadow:t?`0 0 8px ${t}60`:`none`},children:e})}function c({tier:e}){let t=i[e]||i[1];return(0,a.jsx)(s,{color:t.color,children:e===0?`★ SPECIAL`:t.label.toUpperCase()})}function l({status:e}){return(0,a.jsx)(s,{color:r[e]||`#6b6b8a`,children:e})}export{l as n,o as r,c as t};