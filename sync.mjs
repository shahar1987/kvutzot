// Rewrites the static copies of the groups data in index.html (weekly list + JSON-LD)
// from the GROUPS array in its <script>. Run after every change to GROUPS: node sync.mjs
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert";

const file = new URL("index.html", import.meta.url);
let html = readFileSync(file, "utf8");

const src = html.match(/const PHONE = [\s\S]*?\n\];\n(?=const WA)/);
assert(src, "data block (PHONE..GROUPS) not found in index.html");
const { PHONE, DAYNAMES, HALLS, GROUPS } = new Function(src[0] + "return { PHONE, DAYNAMES, HALLS, GROUPS };")();
assert(GROUPS.length && GROUPS.every((g) => HALLS[g.hall] && g.days.length && g.hours && g.price.length), "bad GROUPS entry");

const dayText = (g) => { const n = g.days.map((d) => DAYNAMES[d]); return n.length > 2 ? n.join(", ") : n.join(" ו"); };

const week = "<h3>כל האימונים בשבוע</h3><dl>" +
  Object.entries(HALLS).map(([id, name]) => `<dt>${name}</dt>` +
    GROUPS.filter((g) => g.hall === id).map((g) => `<dd><span>${g.name}</span><span>${dayText(g)}, ${g.hours}</span></dd>`).join("")).join("") + "</dl>";

const url = "https://shahar1987.github.io/kvutzot/";
const ld = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  name: 'מועדון טניס שולחן מבואות החרמון ע"ש רוני גלבוע',
  description: "חוגי טניס שולחן לילדים, לבוגרים ולמתמודדים עם פרקינסון בגליל העליון. אימון ניסיון חינם.",
  url, telephone: "+" + PHONE, image: url + "og.jpg", logo: url + "img/logo_club.png",
  sport: "טניס שולחן", areaServed: "הגליל העליון",
  address: { "@type": "PostalAddress", addressRegion: "הגליל העליון", addressCountry: "IL" },
  location: Object.values(HALLS).map((name) => ({ "@type": "Place", name })),
  makesOffer: GROUPS.map((g) => ({
    "@type": "Offer",
    name: `${g.name}, ${HALLS[g.hall]}`,
    description: `ימי ${dayText(g)}, ${g.hours}. מאמן: ${g.coach}. ${g.price.join("; ")}.`,
    price: Math.min(...g.price.map((p) => parseInt(p, 10))), priceCurrency: "ILS",
  })),
};
assert(ld.makesOffer.every((o) => o.price > 0), "price must start with a number");

const put = (name, body) => {
  const re = new RegExp(`(<!--${name}-->)[\\s\\S]*?(<!--/${name}-->)`);
  assert(re.test(html), `marker ${name} missing`);
  html = html.replace(re, (_, a, b) => a + body + b);
};
put("week", week);
put("ld", `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`);
writeFileSync(file, html);
console.log(`synced ${GROUPS.length} groups`);
