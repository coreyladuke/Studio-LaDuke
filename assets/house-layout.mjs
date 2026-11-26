// Stable picture codes and connections from House Guide v0.1.
const roomRows = [
 ['EXT','Outside',0,8,8],['ENT-01','Front Hall',0,3,4],['GF-LIV','Living Room',0,5,5],
 ['GF-WRK','Workshop',0,4,5],['GF-MHL','Main Hall',0,3,6],['GF-DIN','Dining Nook',0,3,3],
 ['GF-KIT','Kitchen',0,4,4],['GF-PAN','Pantry',0,2,2],['GF-POR','Back Porch',0,4,3],
 ['GF-WDS','The Woods',0,8,8],['GF-ART','Art Studio',0,5,4],['GF-BTH','Hall Bathroom',0,2.2,2.4],
 ['GF-CLO','Coat Closet',0,1.6,2],['GF-MUD','Mudroom',0,3,3],['GF-LAU','Laundry',0,3,3],
 ['UP-LAN','Upstairs Landing',2.72,3,3],['UP-MBR','Main Bedroom',2.72,4,5],
 ['UP-MBB','Main Bedroom Bathroom',2.72,3,3],['UP-WIC','Walk-in Closet',2.72,2.4,3],
 ['UP-BD2','Bedroom Two',2.72,4,4],['UP-LIB','Library',2.72,5,4],['UP-MUS','Music Room',2.72,4,4],
 ['UP-ROF','Roof Lookout',2.72,4,3],['UP-C84','1984 Computer Room',2.72,4,4],
 ['UP-FRT','Maverick’s Fort',5.2,4,4],['BS-LAN','Basement Landing',-2.72,4,4],
 ['BS-ARC','Arcade',-2.72,6,5],['BS-REC','Recording Booth',-2.72,3,3],
 ['BS-CIN','Little Cinema',-2.72,5,6],['BS-POL','Pool Room',-2.72,5,5],
 ['BS-ESC','Escape Room',-2.72,4,4],['BS-MAZ','Movie Maze',-2.72,5,6],
 ['BS-VLT','Curiosity Vault',-2.72,4,4]
];
export const rooms = Object.fromEntries(roomRows.map(([id,name,elevation,width,depth]) =>
 [id,{id,name,elevation,width,depth,height:id==='UP-FRT'?2.1:2.55}]));
const connectionRows = [
 ['front-door','Front Door','EXT','ENT-01'],
 ['living-arch','Living Room Archway','ENT-01','GF-LIV','opening'],
 ['workshop-door','Workshop Door','ENT-01','GF-WRK'],
 ['main-hall-opening','Main Hall Opening','ENT-01','GF-MHL','opening'],
 ['dining-opening','Dining Nook Opening','GF-LIV','GF-DIN','opening'],
 ['kitchen-passage','Kitchen Passage','GF-DIN','GF-KIT','opening'],
 ['pantry-door','Pantry Door','GF-KIT','GF-PAN'],['back-porch-door','Back Porch Door','GF-KIT','GF-POR'],
 ['woods-steps','Woods Steps','GF-POR','GF-WDS','stairs'],
 ['art-studio-door','Art Studio Door','GF-MHL','GF-ART'],['hall-bath-door','Hall Bathroom Door','GF-MHL','GF-BTH'],
 ['coat-closet-door','Coat Closet Door','GF-MHL','GF-CLO'],['mudroom-door','Mudroom Door','GF-MHL','GF-MUD'],
 ['laundry-door','Laundry Door','GF-MUD','GF-LAU'],['main-stairs','Main Stairs','GF-MHL','UP-LAN','stairs'],
 ['main-bedroom-door','Main Bedroom Door','UP-LAN','UP-MBR'],['bedroom-two-door','Bedroom Two Door','UP-LAN','UP-BD2'],
 ['library-door','Library Door','UP-LAN','UP-LIB'],['computer-room-door','Computer Room Door','UP-LAN','UP-C84'],
 ['main-bedroom-bath','Main Bedroom Bath Door','UP-MBR','UP-MBB'],['walk-in-closet','Walk-in Closet Door','UP-MBR','UP-WIC'],
 ['music-room-door','Music Room Door','UP-LIB','UP-MUS'],['lookout-door','Lookout Door','UP-MUS','UP-ROF'],
 ['attic-hatch','Attic Hatch and Drop Ladder','UP-LAN','UP-FRT','hatch'],
 ['basement-stairs','Basement Stairs','GF-MUD','BS-LAN','stairs'],['arcade-door','Arcade Door','BS-LAN','BS-ARC'],
 ['booth-door','Booth Door','BS-LAN','BS-REC'],['cinema-door','Cinema Door','BS-LAN','BS-CIN'],
 ['pool-room-door','Pool Room Door','BS-ARC','BS-POL'],['escape-room-door','Escape Room Door','BS-ARC','BS-ESC'],
 ['maze-door','Maze Door','BS-ESC','BS-MAZ'],['vault-door','Vault Door','BS-MAZ','BS-VLT']
];
export const connections = connectionRows.map(([id,name,from,to,kind='door']) => ({
 id,name,from,to,kind,width:kind==='stairs'?1.10:kind==='opening'?1.02:.84,height:2.12,
 rise:id==='woods-steps'?-.36:rooms[to].elevation-rooms[from].elevation,
 provisional:id==='attic-hatch'||id==='bedroom-two-door'
}));
export function exits(room) {
 return connections.filter(edge=>edge.from===room||edge.to===room)
  .map(edge=>({...edge,destination:edge.from===room?edge.to:edge.from,
   label:edge.id==='attic-hatch'&&room==='UP-LAN'?'Attic Hatch':edge.name}));
}
export function viewpoints(room) {
 return [{id:'primary',name:'Primary'},{id:'reverse',name:'Reverse'},
  ...exits(room).map(edge=>({id:edge.id,name:edge.label}))];
}
