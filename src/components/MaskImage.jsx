import React from 'react'

function MaskImage({ url, w = '1em', h = '1em', bg = "CurrentColor", hBg = "", c="" , hL="1" }) {
  return (
    <div className={`${c} maskimage hoverLevel-${hL}`} style={{ width: w, height: h, backgroundColor: bg, "--h": hBg, "--bg": bg, WebkitMaskImage: `url(${url})`, maskImage: `url(${url})`, maskRepeat: 'no-repeat', maskSize: 'contain', maskPosition: 'center' }}></div>
  )
}

export default MaskImage
