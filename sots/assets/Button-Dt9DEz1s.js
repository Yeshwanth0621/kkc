import{n as e}from"./rolldown-runtime-DF2fYuay.js";import{c as t,t as n}from"./react-C4YTmTFF.js";e(t(),1);var r=n(),i={primary:`
    bg-gradient-to-r from-[#00f0ff] via-[#7c3aed] to-[#ff006e]
    text-white font-bold
    shadow-[0_0_20px_rgba(0,240,255,0.3),0_0_40px_rgba(124,58,237,0.2)]
    hover:shadow-[0_0_30px_rgba(0,240,255,0.5),0_0_60px_rgba(124,58,237,0.3)]
    hover:scale-105 active:scale-[0.98]
    border-transparent
  `,secondary:`
    bg-card/60 backdrop-blur-lg
    text-primary border border-[rgba(0,240,255,0.12)]
    hover:bg-[rgba(0,240,255,0.06)] hover:border-[rgba(0,240,255,0.25)]
    hover:shadow-[0_0_15px_rgba(0,240,255,0.1)]
    hover:text-white
  `,danger:`
    bg-[rgba(255,45,91,0.08)] text-neon-red
    border border-[rgba(255,45,91,0.25)]
    hover:bg-[rgba(255,45,91,0.15)] hover:border-[rgba(255,45,91,0.4)]
    hover:shadow-[0_0_20px_rgba(255,45,91,0.2)]
  `,ghost:`
    bg-transparent text-muted
    hover:text-neon-cyan hover:bg-[rgba(0,240,255,0.05)]
    border-transparent
  `,lime:`
    bg-[rgba(57,255,20,0.08)] text-neon-lime
    border border-[rgba(57,255,20,0.25)]
    hover:bg-[rgba(57,255,20,0.15)] hover:border-[rgba(57,255,20,0.4)]
    hover:shadow-[0_0_15px_rgba(57,255,20,0.15)]
  `,cyan:`
    bg-[rgba(0,240,255,0.08)] text-neon-cyan
    border border-[rgba(0,240,255,0.25)]
    hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.4)]
    hover:shadow-[0_0_15px_rgba(0,240,255,0.15)]
  `},a={sm:`px-3.5 py-1.5 text-xs`,md:`px-5 py-2.5 text-sm`,lg:`px-7 py-3.5 text-base`};function o({variant:e=`primary`,size:t=`md`,loading:n=!1,disabled:o,children:s,className:c=``,...l}){return(0,r.jsxs)(`button`,{className:`
        inline-flex items-center justify-center gap-2
        font-mono font-bold tracking-widest uppercase
        rounded-xl border transition-all duration-300
        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
        ${i[e]}
        ${a[t]}
        ${c}
      `,disabled:o||n,...l,children:[n&&(0,r.jsxs)(`svg`,{className:`animate-spin h-4 w-4`,viewBox:`0 0 24 24`,children:[(0,r.jsx)(`circle`,{className:`opacity-25`,cx:`12`,cy:`12`,r:`10`,stroke:`currentColor`,strokeWidth:`4`,fill:`none`}),(0,r.jsx)(`path`,{className:`opacity-75`,fill:`currentColor`,d:`M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z`})]}),s]})}export{o as t};