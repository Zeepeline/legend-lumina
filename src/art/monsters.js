'use strict';
// Monster (peta piksel di MON)
// ---------- monster (peta string) ----------
const MON = {
  slime: { pal: { G: '#5ccf4a', L: '#e8ffe0', E: '#1a2a1a', D: '#2f8a2a' }, f: [
    ["................", "......GGGG......", "....GGGGGGGG....", "...GLLGGGGGGG...", "..GGLGGGGGGGGG..", "..GGGGGGGGGGGG..", ".GGGGEGGGGEGGGG.", ".GGGGEGGGGEGGGG.", ".GGGGGGGGGGGGGG.", ".GGGGGGGGGGGGGG.", "..DDDDDDDDDDDD.."],
    ["................", "................", "................", ".....GGGGGG.....", "...GGGGGGGGGG...", "..GLLGGGGGGGGG..", ".GGLGGGGGGGGGGG.", "GGGGGEGGGGGEGGGG", "GGGGGEGGGGGEGGGG", "GGGGGGGGGGGGGGGG", ".DDDDDDDDDDDDDD."]] },
  bat: { pal: { W: '#6a4a9a', B: '#4a2f6a', E: '#ffda3a', F: '#ffffff' }, f: [
    ["W..............W", "WW............WW", "WWW..B....B..WWW", ".WWWBBBBBBBBWWW.", "..WWBBEBBEBBWW..", "...WBBBBBBBBW...", "....BBFBBFBB....", ".....BBBBBB.....", "......B..B......", "................"],
    ["................", "................", ".....B....B.....", "....BBBBBBBB....", "...WBBEBBEBBW...", "..WWBBBBBBBBWW..", ".WWWWBFBBFBWWWW.", "WWW..BBBBBB..WWW", "WW....B..B....WW", "W..............W"]] },
  shroom: { pal: { R: '#d83a3a', W: '#ffffff', S: '#f0dcb8', E: '#2a1a1a', F: '#8a5a32' }, f: [
    ["....RRRRRR....", "..RRWWRRRRRR..", ".RRWWRRRRWWRR.", "RRRRRRRRRWWRRR", "RRWWRRRRRRRRRR", "RRWWRRRRRRWWRR", ".RRRRRRRRRRRR.", "...SSSSSSSS...", "...SESSSSES...", "...SESSSSES...", "...SSSSSSSS...", "....SSSSSS....", "....FF..FF...."],
    ["..............", "....RRRRRR....", "..RRWWRRRRRR..", ".RRWWRRRRWWRR.", "RRRRRRRRRWWRRR", "RRWWRRRRRRWWRR", ".RRRRRRRRRRRR.", "...SSSSSSSS...", "...SESSSSES...", "...SESSSSES...", "...SSSSSSSS...", "....SSSSSS....", "...FF....FF..."]] },
  cat: { pal: { G: '#a8a4b0', W: '#f4f2f8', E: '#2a2a2a', P: '#ff9ab0' }, f: [
    ["..G.G.........", "..GGGG........", ".GEGEG........", ".GGPGG.......G", "..GGGGGGGGG.G.", "..GWWGGGGGGG..", "..GG.G..G.G...", "..............".slice(0)],
    ["..G.G.........", "..GGGG........", ".GEGEG.......G", ".GGPGG......G.", "..GGGGGGGGGG..", "..GWWGGGGGGG..", "...G.G.G..G...", ".............."]] },
  fox: { pal: { O: '#f08a3a', W: '#fff4e8', E: '#2a1a1a', D: '#4a2a1a' }, f: [
    [".O..O...........", ".OOOO...........", "OEOOEO......OOO.", "OOOOOO....OOOOOW", ".OWWOOOOOOOOO.WW", "..WOOOOOOOOO....", "...D.D...D.D....", "................"],
    [".O..O...........", ".OOOO.......OO..", "OEOOEO....OOOOO.", "OOOOOO...OOOOOWW", ".OWWOOOOOOOOO...", "..WOOOOOOOOO....", "..D.D.....D.D...", "................"]] },
};
function artMon(name, palOver) {
  const m = MON[name], pal = Object.assign({}, m.pal, palOver || {});
  const fr0 = m.f.map(rows => { const c = renderMap(rows, pal); return outline(c, name === 'cat' || name === 'fox' ? '#3a2a2a' : '#1e1626'); });
  const w = Math.max(...fr0.map(c => c.width)) + 2, h = Math.max(...fr0.map(c => c.height)) + 2;
  return strip(fr0.map(c => { const [f, x] = mk(w, h); x.drawImage(c, 1, h - c.height - 1); return f; }));
}
// ---------- monster tambahan ----------
Object.assign(MON, {
  wolf: { pal: { G: '#8e98ac', D: '#5c6680', W: '#eef0f6', E: '#ffd23a', K: '#33343e' }, f: [
    [".G..G...............", ".GGGG...............", "GGEGGG..............", "GGGGGGGGGGGGGGG..GG.", ".WWGGGGGGGGGGGGGGG..", "..WGGGGGGGGGGGGGD...", "...GGGDDDDGGGGGD....", "...G.G......G.G.....", "...K.K......K.K....."],
    [".G..G...............", ".GGGG...............", "GGEGGG.........GG...", "GGGGGGGGGGGGGGGG.G..", ".WWGGGGGGGGGGGGGG...", "..WGGGGGGGGGGGGGD...", "...GGGDDDDGGGGGD....", "..G...G....G...G....", "..K....K..K.....K..."]] },
  boar: { pal: { B: '#9a6a42', D: '#6e4628', P: '#f0a898', W: '#fffbe8', E: '#1a1010', K: '#3a2418', H: '#5a3a20' }, f: [
    ["....HHHHHHHH........", "..BBBBBBBBBBBBB.....", ".BEBBBBBBBBBBBBB.H..", "WBBBBBBBBBBBBBBBBH..", "WPPBBBBBBBBBBBBBB...", ".PPBBBBDDDDBBBBB....", "..BBDDDDDDDDDDBB....", "...B.B......B.B.....", "...K.K......K.K....."],
    ["....HHHHHHHH........", "..BBBBBBBBBBBBB.....", ".BEBBBBBBBBBBBBB.H..", "WBBBBBBBBBBBBBBBBH..", "WPPBBBBBBBBBBBBBB...", ".PPBBBBDDDDBBBBB....", "..BBDDDDDDDDDDBB....", "..B...B....B...B....", "..K....K..K.....K..."]] },
  bee: { pal: { Y: '#ffd23a', K: '#2a2020', W: '#e8f6ff', E: '#1a1010', S: '#7a5a3a' }, f: [
    ["..WW..WW....", "..WWW.WWW...", "...WW.WW....", ".YYKYYKYY...", "YEYKYYKYYS..", "YYYKYYKYY...", ".YYKYYKY...."],
    ["............", "............", "..WWWWWW....", ".YYKYYKYY...", "YEYKYYKYYS..", "YYYKYYKYY...", ".YYKYYKY...."]] },
  snake: { pal: { G: '#6ab84a', L: '#c8e878', E: '#1a1010', R: '#e83a3a' }, f: [
    ["...GGG..........", "R.GEGGG.........", ".GGGGG...GGGG...", "...GGG..GGLLGG..", "....GGGGGL..GGG.", ".....GGLG....GG."],
    ["...GGG..........", "..GEGGG.........", ".GGGGG..........", "...GGG...GGGG...", "....GGGGGGLLGG..", "......GGL...GGGG"]] },
  plant: { pal: { P: '#e84a8a', Y: '#ffd84a', K: '#5a1030', R: '#ff6a6a', G: '#3f8a34', L: '#6cc04a', D: '#7a4e2c', W: '#ffffff' }, f: [
    ["...PPPPPP.....", "..PPYYYYPP....", ".PPYKKKKYPP...", ".PYKWRRWKYP...", ".PYKRRRRKYP...", ".PPYKKKKYPP...", "..PPYYYYPP....", "...PPPPPP.....", "......G.......", "..LL..G..LL...", ".LLLL.G.LLLL..", "..LLLLGLLLL...", "....GGGGG.....", "...DDDDDDD...."],
    ["..............", "...PPPPPP.....", "..PPYYYYPP....", ".PPYYYYYYPP...", ".PYYKKKKYYP...", ".PPYYYYYYPP...", "..PPYYYYPP....", "...PPPPPP.....", "......G.......", "..LL..G..LL...", ".LLLL.G.LLLL..", "..LLLLGLLLL...", "....GGGGG.....", "...DDDDDDD...."]] },
  ghost: { pal: { W: '#eef4ff', S: '#b8c8e8', K: '#2a2a4a', M: '#4a3a6a' }, f: [
    ["....WWWWWW......", "..WWWWWWWWWW....", ".WWWWWWWWWWWW...", ".WWKKWWWWKKWW...", ".WWKKWWWWKKWW...", "WWWWWWWWWWWWWW..", "WWWWWMMMMWWWWW..", "WWWWWWMMWWWWWW..", "SWWWWWWWWWWWWS..", "SWWWWWWWWWWWWS..", "SS.SWW.WWS.SSS..", "S...S...S...S..."],
    ["....WWWWWW......", "..WWWWWWWWWW....", ".WWWWWWWWWWWW...", ".WWKKWWWWKKWW...", ".WWKKWWWWKKWW...", "WWWWWWWWWWWWWW..", "WWWWWWMMWWWWWW..", "WWWWWMMMMWWWWW..", "SWWWWWWWWWWWWS..", "SWWWWWWWWWWWWS..", "SSS.SWW.WWS.SS..", ".S...S...S...S.."]] },
  golem: { pal: { R: '#8a8494', D: '#5e5868', L: '#b4aebe', E: '#7af0ff', M: '#4f9a3a', C: '#3a3644' }, f: [
    [".......LLLLLL.......", ".....LLRRRRRRR......", ".....LRERRRERR......", ".....RRRRRRRRD......", "..LLLRRCCCCRRDDDD...", ".LLRRRRRRRRRRRRDDD..", ".LRRRRRMMRRRRRRRDD..", ".RRR.RRRRRRRRR.DDD..", ".RRR.RRRRRRRRD.DDD..", ".DDD.RRRRDDDDD.DDD..", "LLLL.RRRR..DDD.CCCC.", ".....LRR....DD......", "....LLRR....DDD.....", "....CCCC....CCCC...."],
    [".......LLLLLL.......", ".....LLRRRRRRR......", ".....LRERRRERR......", ".....RRRRRRRRD......", "..LLLRRCCCCRRDDDD...", ".LLRRRRRRRRRRRRDDD..", ".LRRRRRMMRRRRRRRDD..", ".RRR.RRRRRRRRR.DDD..", ".RRR.RRRRRRRRD.DDD..", ".DDD.RRRRDDDDD.DDD..", ".CCC.RRRR..DDD.DDD..", ".....LRR....DD.CCCC.", "....LLRR.....DDD....", "....CCCC.....CCCC..."]] },
});
Object.assign(MON, {
  frog: { pal: { G: '#5a9a4a', L: '#dcecA0', W: '#ffffff', E: '#1a1a1a' }, f: [
    ["................", "..GG......GG....", ".GWEG....GEWG...", ".GGGGGGGGGGGG...", "GGGGGGGGGGGGGG..", "GLLLLLLLLLLLLG..", "GGLLLLLLLLLLGG..", ".GG.GGGGGG.GG...", "GGG........GGG.."],
    ["..GG......GG....", ".GWEG....GEWG...", ".GGGGGGGGGGGG...", "GGGGGGGGGGGGGG..", "GLLLLLLLLLLLLG..", ".GLLLLLLLLLLG...", "..GGGGGGGGGG....", ".G..........G...", "G............G.."]] },
});
function artWisp() { const fr2 = []; for (let f = 0; f < 2; f++) { const [c, x] = mk(14, 16); const g = x.createRadialGradient(7, 7, 0, 7, 7, 7); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(160,255,200,.95)'); g.addColorStop(1, 'rgba(60,200,140,0)'); x.fillStyle = g; x.fillRect(0, 0, 14, 14); fr(x, '#1a3a2a', 5, 6, 1, 2); fr(x, '#1a3a2a', 8, 6, 1, 2); fr(x, 'rgba(160,255,200,.6)', 6 + (f ? 1 : -1), 13, 2, 3); fr2.push(c); } return strip(fr2); }
