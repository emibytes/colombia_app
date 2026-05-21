import { Player } from "@/types";

export const PLAYERS: Player[] = [
  // ── GOALKEEPERS ─────────────────────────────────────
  { id:1,  name:"Camilo Vargas",        position:"Portero",           group:"GK",  age:34, club:"Atlas FC",         country:"México"       },
  { id:2,  name:"Álvaro Montero",       position:"Portero",           group:"GK",  age:29, club:"Millonarios",       country:"Colombia"     },
  { id:3,  name:"Kevin Mier",           position:"Portero",           group:"GK",  age:25, club:"Atlético Nacional", country:"Colombia"     },

  // ── DEFENDERS ────────────────────────────────────────
  { id:4,  name:"Daniel Muñoz",         position:"Lateral Derecho",   group:"DEF", age:29, club:"Crystal Palace",    country:"Inglaterra"   },
  { id:5,  name:"Dávinson Sánchez",     position:"Central",           group:"DEF", age:30, club:"Girona FC",         country:"España"       },
  { id:6,  name:"Yerry Mina",           position:"Central",           group:"DEF", age:31, club:"Cagliari",          country:"Italia"       },
  { id:7,  name:"Carlos Cuesta",        position:"Central",           group:"DEF", age:28, club:"Feyenoord",         country:"Países Bajos" },
  { id:8,  name:"Jhon Lucumí",          position:"Central",           group:"DEF", age:28, club:"Bologna FC",        country:"Italia"       },
  { id:9,  name:"Johan Mojica",         position:"Lateral Izquierdo", group:"DEF", age:34, club:"Villarreal CF",     country:"España"       },
  { id:10, name:"Cristian Borja",       position:"Lateral Izquierdo", group:"DEF", age:32, club:"Millonarios",       country:"Colombia"     },
  { id:11, name:"Frank Fabra",          position:"Lateral Izquierdo", group:"DEF", age:35, club:"Boca Juniors",      country:"Argentina"    },
  { id:12, name:"Santiago Arias",       position:"Lateral Derecho",   group:"DEF", age:33, club:"Atlético Nacional", country:"Colombia"     },
  { id:13, name:"Óscar Murillo",        position:"Central",           group:"DEF", age:34, club:"Junior FC",         country:"Colombia"     },

  // ── MIDFIELDERS ──────────────────────────────────────
  { id:14, name:"James Rodríguez",      position:"Mediapunta",        group:"MID", age:35, club:"Rayo Vallecano",    country:"España"       },
  { id:15, name:"Wilmar Barrios",       position:"Volante Defensivo", group:"MID", age:32, club:"Zenit",             country:"Rusia"        },
  { id:16, name:"Jefferson Lerma",      position:"Volante",           group:"MID", age:31, club:"Crystal Palace",    country:"Inglaterra"   },
  { id:17, name:"Richard Ríos",         position:"Volante",           group:"MID", age:24, club:"Palmeiras",         country:"Brasil"       },
  { id:18, name:"Mateus Uribe",         position:"Volante",           group:"MID", age:35, club:"Club América",      country:"México"       },
  { id:19, name:"Jorge Carrascal",      position:"Mediapunta",        group:"MID", age:28, club:"Zenit",             country:"Rusia"        },
  { id:20, name:"Jhon Arias",           position:"Extremo",           group:"MID", age:28, club:"Fluminense",        country:"Brasil"       },
  { id:21, name:"Déiner Mosquera",      position:"Extremo",           group:"MID", age:23, club:"RC Lens",           country:"Francia"      },
  { id:22, name:"Kevin Castaño",        position:"Volante",           group:"MID", age:30, club:"Racing Club",       country:"Argentina"    },
  { id:23, name:"Gustavo Puerta",       position:"Volante",           group:"MID", age:22, club:"Bayer Leverkusen",  country:"Alemania"     },
  { id:24, name:"Juan F. Quintero",     position:"Mediapunta",        group:"MID", age:33, club:"Junior FC",         country:"Colombia"     },
  { id:25, name:"Juan G. Cuadrado",     position:"Extremo",           group:"MID", age:38, club:"Ind. Santa Fe",     country:"Colombia"     },
  { id:26, name:"Daniel Ruiz",          position:"Mediapunta",        group:"MID", age:22, club:"Club Brujas",       country:"Bélgica"      },
  { id:27, name:"Luciano Ospina",       position:"Extremo",           group:"MID", age:22, club:"Atlético Nacional", country:"Colombia"     },

  // ── FORWARDS ─────────────────────────────────────────
  { id:28, name:"Luis Díaz",            position:"Extremo",           group:"FWD", age:29, club:"Liverpool FC",      country:"Inglaterra"   },
  { id:29, name:"Rafael Santos Borré",  position:"Delantero",         group:"FWD", age:30, club:"Werder Bremen",     country:"Alemania"     },
  { id:30, name:"Jhon Durán",           position:"Delantero",         group:"FWD", age:22, club:"Aston Villa",       country:"Inglaterra"   },
  { id:31, name:"Cucho Hernández",      position:"Delantero",         group:"FWD", age:26, club:"Columbus Crew",     country:"EE.UU."       },
  { id:32, name:"Alfredo Morelos",      position:"Delantero",         group:"FWD", age:30, club:"Atlético Nacional", country:"Colombia"     },
  { id:33, name:"Miguel Ángel Borja",   position:"Delantero",         group:"FWD", age:32, club:"River Plate",       country:"Argentina"    },
  { id:34, name:"Jhon Córdoba",         position:"Delantero",         group:"FWD", age:33, club:"Krasnodar",         country:"Rusia"        },
  { id:35, name:"Baldomero Perlaza",    position:"Extremo",           group:"FWD", age:26, club:"Atlético Nacional", country:"Colombia"     },
  { id:36, name:"Roger Martínez",       position:"Delantero",         group:"FWD", age:30, club:"Atlético Nacional", country:"Colombia"     },
];

export const PLAYERS_MAP: Record<number, Player> = Object.fromEntries(
  PLAYERS.map((p) => [p.id, p])
);

export const GROUP_LABELS: Record<string, string> = {
  ALL: "Todos",
  GK:  "Porteros",
  DEF: "Defensas",
  MID: "Mediocampistas",
  FWD: "Delanteros",
};
