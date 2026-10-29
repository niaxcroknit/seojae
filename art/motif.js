// Book-spine motif shared by icon, feature graphic and splash. Coordinates on a 1024 box.
module.exports = function motif(opts) {
  const o = Object.assign({ light: '#EEF0EC', mid: '#CFE0D7', hl: '#F3E37C', band: '#2F4A3F' }, opts || {});
  return `
  <rect x="300" y="704" width="424" height="26" rx="6" fill="${o.light}"/>
  <rect x="318" y="318" width="104" height="386" rx="10" fill="${o.light}"/>
  <rect x="318" y="362" width="104" height="14" fill="${o.band}" opacity=".9"/>
  <rect x="318" y="640" width="104" height="14" fill="${o.band}" opacity=".9"/>
  <rect x="436" y="382" width="92" height="322" rx="10" fill="${o.mid}"/>
  <rect x="436" y="420" width="92" height="12" fill="${o.band}" opacity=".85"/>
  <g transform="rotate(14 548 704)">
    <rect x="548" y="350" width="98" height="354" rx="10" fill="${o.hl}"/>
    <rect x="548" y="394" width="98" height="13" fill="${o.band}" opacity=".85"/>
    <rect x="548" y="644" width="98" height="13" fill="${o.band}" opacity=".85"/>
  </g>`;
};
