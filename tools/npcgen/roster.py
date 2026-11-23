"""Penampilan tiap NPC (dari docs/NPC_ROSTER.md §4) + parser daftar NPC & urutan baris kegiatan langsung dari dokumen itu."""
import os, re

DOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'docs', 'NPC_ROSTER.md'))


def parse_doc():
    sec = open(DOC).read().split('## 4. Daftar NPC')[1].split('## 5.')[0]; out = {}; cur = None
    for l in sec.split('\n'):
        m = re.match(r'\*\*(\w+) · (.*?)\*\*', l)
        if m: cur = m.group(1); out[cur] = []
        m = re.match(r'- \*\*Baris kegiatan[^:]*:\*\* (.*)', l)
        if m and cur:
            for a in re.findall(r'`(\w+)`', m.group(1)):
                if a not in out[cur]: out[cur].append(a)
    return out


# warna rambut
BRN = (88, 58, 42); BLK = (42, 34, 38); BLD = (214, 182, 104); RED = (178, 72, 48); WHT = (238, 238, 242); GRY = (168, 164, 160); SLV = (212, 216, 228)
STEEL = (150, 160, 176); NAVY = (50, 72, 124); LEA = (126, 96, 66); CRM = (230, 218, 190); ACAD = (60, 92, 172); WHI = (242, 242, 238); GRYP = (134, 134, 144)
BRP = (118, 90, 64)
UNI = dict(top=WHI, vest=ACAD, pants=GRYP, boots=(96, 76, 60))

S = {
    'gk1': dict(hair=GRY, stache='thick', beardc=(190, 186, 180), brow=1, hat='helm', hatc=(196, 52, 52), armor=('plate', STEEL), pauldron=STEEL, cape=(146, 38, 42), sheath=1, belt=BRP, top=(130, 40, 44), pants=(96, 70, 50), weapon='sword', sleeve='long'),
    'gk2': dict(hair=BRN, hairstyle='messy', top=(150, 150, 156), vest=LEA, bracer=LEA, pants=(130, 96, 66), weapon='wspear'),
    'gk5': dict(skin='tan', hairstyle='bald', beard='short', beardc=BLK, fat=1, top=NAVY, armor=('chain', STEEL), back=('shield', (150, 110, 70)), sheath=1, weapon='sword', sleeve='long'),
    'gk6': dict(hair=BLK, hairstyle='pony', top=(226, 214, 184), belt=(184, 40, 40), pants=(130, 100, 70), weapon='wsword'),
    'gk7': dict(hair=BLK, hairstyle='braid1', headband=(196, 48, 48), top=(172, 96, 74), armor=('leather', (150, 82, 60)), pauldron=STEEL, weapon='wspear'),
    'gk3': dict(hair=(166, 134, 72), hairstyle='long', top=(176, 170, 140), vest=LEA, cape=(84, 112, 66), back=('quiver', (120, 90, 60)), bracer=BRP, weapon='bow'),
    'gk8': dict(hair=(168, 84, 56), hairstyle='pony', top=(112, 122, 62), belt=LEA, pants=(130, 96, 66), back=('quiver', (120, 90, 60)), bowshort=1),
    'gk4': dict(skin='tan', hair=GRY, hat='jerami', hatc=(214, 190, 120), top=CRM, apron=(134, 92, 60), boots=(90, 72, 54), tool='brush'),
    'merc1': dict(hair=RED, hairstyle='spiky', scar=1, top=(60, 50, 54), armor=('leather', (44, 38, 42)), studs=1, cape=(138, 126, 116), pauldron=(70, 64, 68), pants=(62, 50, 50), boots=(58, 44, 38), weapon='axe', sleeve='long'),
    'gk9': dict(skin='tan', hair=BRN, hairstyle='pony', dress=(122, 84, 54), belt=(80, 56, 40), hip=[(150, 110, 70), (120, 90, 60)], back=('sword', (120, 100, 80)), weapon='sword', sleeve='long'),
    'gk10': dict(skin='pale', hair=SLV, hat='tudung', hatc=(132, 136, 148), armor=('scale', (80, 112, 152)), sheath=1, pants=(70, 76, 96), weapon='dagger'),
    'courier': dict(kid=1, hair=BRN, hairstyle='spiky', hat='pet', hatc=(60, 100, 192), top=(240, 208, 72), pants=(130, 100, 70), back=('satchel', (150, 110, 70)), give='scroll'),
    'st1': dict(elder=1, skin='pale', hair=WHT, hairstyle='bun', glasses=1, top=(122, 72, 142), sash=(150, 100, 170), hip=[(120, 190, 230), (230, 120, 120), (120, 220, 150)], sleeve='long', goods=('bottle', (120, 190, 230))),
    'st2': dict(skin='ruddy', hairstyle='bald', fat=2, stache='thick', beardc=BRN, apron=(242, 240, 232), towel=1, top=(204, 192, 172), goods=('bread', None)),
    'st3': dict(skin='tan', hair=BLK, vest=LEA, top=(150, 120, 90), sleeve='none', gloves=(90, 70, 56), pants=(74, 64, 64), goods=('sword', None)),
    'st4': dict(elder=1, skin='pale', hair=WHT, beard='long', beardc=WHT, robe=(52, 72, 132), hat='kerucut', hatc=(52, 72, 132), sleeve='long', goods=('scroll', None)),
    'st5': dict(hair=BLK, hairstyle='bun', headband=(236, 202, 70), top=(94, 152, 84), pants=(130, 100, 70), apron=(214, 188, 130), goods=('veg', (120, 180, 80))),
    'st6': dict(hair=BRN, hairstyle='curly', glasses=1, vest=NAVY, top=CRM, pants=(110, 90, 70), goods=('scroll', None)),
    'st7': dict(hair=BLK, hairstyle='long', dress=(194, 164, 226), goods=('bottle', (190, 140, 230))),
    'st8': dict(hair=BLK, hairstyle='cepak', fat=1, headband=(40, 36, 44), top=(130, 100, 70), armor=('chain', STEEL), sleeve='none', goods=('sword', None)),
    'ps1': dict(hair=(200, 150, 92), hairstyle='bun', dress=(238, 152, 178)),
    'ps2': dict(hat='caping', hatc=(206, 176, 100), top=(204, 192, 162), dress=(142, 104, 72), back=('sack', (206, 184, 140)), hair=GRY),
    'kp1': dict(hat='kerudung', hatc=(240, 226, 190), dress=(196, 156, 114), hip=[(196, 160, 90), (170, 130, 70)]),
    'kp4': dict(hair=BRN, hairstyle='braid2', hat='pita', hatc=(244, 208, 60), dress=(156, 196, 242)),
    'kp7': dict(hat='peci', hatc=(40, 36, 40), top=(142, 98, 62), pants=(60, 50, 50), give='chicken'),
    'ps3': dict(hair=(70, 192, 172), hairstyle='long', dress=(242, 152, 62), sash=(252, 212, 124), inst='lute'),
    'ps4': dict(elder=1, hat='caping', hatc=(190, 170, 110), top=(142, 122, 100), pants=(100, 90, 80), hair=GRY),
    'ps5': dict(dress=(112, 114, 122), hat='bulat', hatc=(92, 92, 102), hip=[(255, 214, 110)], hair=GRY, sleeve='long'),
    'ps6': dict(elder=1, hairstyle='bald', robe=(242, 240, 232), sash=(232, 192, 72), sleeve='long', pray_prop='candle'),
    'ps7': dict(kid=1, hair=(150, 100, 60), hairstyle='messy', top=(242, 212, 72), pants=(120, 94, 70), give='parcel'),
    'pm1': dict(skin='ruddy', fat=2, hat='bersayap', hatc=(60, 92, 162), hair=BRN, dress=(62, 92, 152), hip=[(240, 200, 70)], sleeve='long'),
    'pm2': dict(elder=1, glasses=1, hair=GRY, top=(238, 232, 202), pants=(90, 80, 70), sleeve='long'),
    'pm3': dict(hair=BRN, hairstyle='bun', top=(92, 152, 100), dress=(152, 112, 80)),
    'pm4': dict(hat='kerudung', hatc=(250, 244, 222), robe=(246, 242, 232), sash=(232, 192, 72), sleeve='long', pray_prop='censer'),
    'pm5': dict(hair=BLK, hairstyle='pony', dress=(172, 124, 192)),
    'pm6': dict(hat='kerudung', hatc=(52, 46, 52), dress=(178, 82, 70)),
    'pm7': dict(skin='ruddy', fat=1, hat='bulat', hatc=(150, 120, 86), dress=(132, 98, 66), hair=BRN, sleeve='long'),
    'ac1': dict(hair=BLK, hairstyle='bun', robe=(44, 62, 124), scarf=(230, 194, 84), sleeve='long', bookc=(134, 88, 52)),
    'ac2': dict(kid=1, hair=BRN, back=('satchel', LEA), **UNI),
    'ac3': dict(kid=1, hair=BLK, hairstyle='spiky', **UNI),
    'ac4': dict(kid=1, hair=SLV, hairstyle='braid1', **UNI),
    'ka1': dict(hair=(182, 72, 52), scarf=(72, 112, 202), **UNI),
    'ka3': dict(hair=(228, 202, 122), glasses=1, **UNI),
    'ac5': dict(hat='jerami', hatc=(202, 172, 102), apron=(84, 134, 84), top=(204, 194, 164), boots=(60, 60, 66), hair=GRY),
    'ac6': dict(elder=1, robe=(62, 42, 114), hat='kerucut', hatc=(62, 42, 114), beard='long', beardc=(176, 176, 182), glasses=1, glassc=(90, 130, 210), sleeve='long'),
    'ac7': dict(hair=BRN, headband=WHI, top=WHI, belt=ACAD, pants=GRYP, weapon='wsword'),
    'ac8': dict(hair=BLK, bowshort=1, **UNI),
    'ac9': dict(elder=1, hair=GRY, hairstyle='cepak', **UNI),
    'bw1': dict(kid=1, skin='tan', hair=BLK, hairstyle='messy', headband=(232, 230, 220), top=(204, 60, 60), pants=(142, 122, 90), boots=(206, 168, 134)),
    'bw2': dict(hat='tudung', hatc=(124, 94, 66), dress=(176, 124, 92), hair=BRN, inst='flute'),
    'bw3': dict(elder=1, hat='kerudung', hatc=(152, 142, 122), dress=(152, 122, 102), hair=GRY),
    'vl1': dict(hair=BLK, hairstyle='braid2', dress=(176, 214, 156)),
    'vl2': dict(hair=BLK, top=(232, 216, 182), pants=(122, 92, 72)),
    'md1': dict(skin='pale', fat=2, hat='rajut', hatc=(238, 232, 218), top=(244, 242, 236), pants=(226, 220, 206)),
    'md2': dict(hat='caping', hatc=(206, 176, 102), top=(82, 124, 194), pants=(152, 132, 100), hair=BLK),
    'lk1': dict(elder=1, skin='pale', hat='rajut', hatc=(122, 62, 62), beard='short', beardc=WHT, dress=(232, 198, 62), sleeve='long', hair=WHT),
    'lk2': dict(hair=BRN, dress=(62, 92, 66), back=('pack', (124, 98, 72)), sleeve='long'),
    'rd1': dict(skin='tan', hat='sorban', hatc=(152, 112, 72), vest=(132, 102, 72), top=CRM, back=('pack', (124, 98, 72))),
    'rd2': dict(hat='kerudung', hatc=(112, 132, 172), dress=(112, 132, 172), sleeve='long'),
    'in1': dict(skin='ruddy', fat=1, hair=BRN, hairstyle='messy', top=(228, 216, 192), pants=(124, 96, 70), cup='cup'),
    'in2': dict(hair=BRN, hairstyle='curly', dress=(152, 102, 72), cup='bowl'),
    'in3': dict(hair=BRN, hairstyle='messy', top=(112, 82, 58), pants=(70, 64, 70), sleeve='long'),
    'tp1': dict(hair=BLK, hairstyle='pony', robe=(248, 246, 238), sleeve='long', pray_prop='candle'),
    'ar1': dict(elder=1, skin='pale', hair=WHT, glasses=1, robe=(112, 82, 58), sleeve='long', bookc=(120, 90, 60)),
    'ar2': dict(hair=BRN, robe=(60, 102, 82), sleeve='long', bookc=(60, 90, 140)),
}
