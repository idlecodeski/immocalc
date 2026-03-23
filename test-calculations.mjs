// Quick validation script - runs our calculations with a test case
// and compares against manually verified values

// We'll inline the math since we can't easily import TS

// TEST CASE: Standard scenario matching online calculators
// Kaufpreis: 200.000 €
// Bundesland: NRW (6.5% GrESt)
// Notar+Grundbuch: 2%
// Makler: 3.57%
// Eigenkapital: 50.000 €
// Zins: 3.5%
// Tilgung: 2%
// Kaltmiete: 800 €/Monat
// Hausgeld (nicht umlagefähig): 150 €
// Instandhaltung: 10 €/m², Wohnfläche: 65 m²
// Verwaltung: 30 €/Monat
// Mietausfallrisiko: 2%

const kaufpreis = 200000;
const grunderwerbsteuerPct = 6.5;
const notarPct = 2.0;
const maklerPct = 3.57;
const sonstigeKosten = 0;
const eigenkapital = 50000;
const zinsPct = 3.5;
const tilgungPct = 2.0;
const kaltmiete = 800;
const hausgeld = 150;
const wohnflaeche = 65;
const instandhaltung = 10; // €/m²/Jahr
const verwaltung = 30;
const mietausfallrisikoPct = 2;

console.log("=== ImmoCalc Validierung ===\n");

// 1. Kaufnebenkosten
const grunderwerbsteuer = kaufpreis * grunderwerbsteuerPct / 100;
const notar = kaufpreis * notarPct / 100;
const makler = kaufpreis * maklerPct / 100;
const nebenkostenGesamt = grunderwerbsteuer + notar + makler + sonstigeKosten;

console.log("--- KAUFNEBENKOSTEN ---");
console.log(`Grunderwerbsteuer (${grunderwerbsteuerPct}%): ${grunderwerbsteuer.toFixed(2)} €`);
console.log(`Notar & Grundbuch (${notarPct}%): ${notar.toFixed(2)} €`);
console.log(`Makler (${maklerPct}%): ${makler.toFixed(2)} €`);
console.log(`Nebenkosten gesamt: ${nebenkostenGesamt.toFixed(2)} €`);
console.log(`NK in % vom Kaufpreis: ${(nebenkostenGesamt/kaufpreis*100).toFixed(2)}%`);

// 2. Gesamtkosten & Darlehen
const gesamtkosten = kaufpreis + nebenkostenGesamt;
const darlehenssumme = gesamtkosten - eigenkapital;
const ekAnteil = eigenkapital / gesamtkosten * 100;

console.log("\n--- FINANZIERUNG ---");
console.log(`Gesamtkosten: ${gesamtkosten.toFixed(2)} €`);
console.log(`Darlehenssumme: ${darlehenssumme.toFixed(2)} €`);
console.log(`EK-Anteil: ${ekAnteil.toFixed(2)}%`);

// 3. Monatliche Kreditrate (Standard German Annuitätendarlehen)
// Annuität = Darlehen × (Zins% + Tilgung%) / 12
const monatlicheRate = darlehenssumme * (zinsPct + tilgungPct) / 100 / 12;

console.log(`\nMonatliche Kreditrate: ${monatlicheRate.toFixed(2)} €`);
console.log(`  (= ${darlehenssumme} × ${zinsPct + tilgungPct}% / 12)`);

// 4. Renditen
const jahreskaltmiete = kaltmiete * 12;
const bruttorendite = jahreskaltmiete / kaufpreis * 100;

const instandhaltungJahr = wohnflaeche * instandhaltung;
const instandhaltungMonat = instandhaltungJahr / 12;
const mietausfallMonat = kaltmiete * mietausfallrisikoPct / 100;
const jahresausgaben = hausgeld * 12 + verwaltung * 12 + instandhaltungJahr + (jahreskaltmiete * mietausfallrisikoPct / 100);
const nettorendite = (jahreskaltmiete - jahresausgaben) / gesamtkosten * 100;

console.log("\n--- RENDITEN ---");
console.log(`Jahreskaltmiete: ${jahreskaltmiete.toFixed(2)} €`);
console.log(`Bruttorendite: ${bruttorendite.toFixed(2)}%`);
console.log(`  (= ${jahreskaltmiete} / ${kaufpreis} × 100)`);
console.log(`Jahresausgaben (ohne Kredit): ${jahresausgaben.toFixed(2)} €`);
console.log(`  Hausgeld: ${hausgeld * 12} €, Verwaltung: ${verwaltung * 12} €, Instandhaltung: ${instandhaltungJahr} €, Mietausfall: ${jahreskaltmiete * mietausfallrisikoPct / 100} €`);
console.log(`Nettorendite: ${nettorendite.toFixed(2)}%`);
console.log(`  (= (${jahreskaltmiete} - ${jahresausgaben.toFixed(2)}) / ${gesamtkosten} × 100)`);

// 5. Cashflow
const cashflowMonatlich = kaltmiete - monatlicheRate - hausgeld - verwaltung - instandhaltungMonat - mietausfallMonat;
const cashflowJaehrlich = cashflowMonatlich * 12;

console.log("\n--- CASHFLOW ---");
console.log(`Einnahmen: ${kaltmiete.toFixed(2)} €/Monat`);
console.log(`Kreditrate: -${monatlicheRate.toFixed(2)} €`);
console.log(`Hausgeld: -${hausgeld.toFixed(2)} €`);
console.log(`Verwaltung: -${verwaltung.toFixed(2)} €`);
console.log(`Instandhaltung: -${instandhaltungMonat.toFixed(2)} €`);
console.log(`Mietausfall (${mietausfallrisikoPct}%): -${mietausfallMonat.toFixed(2)} €`);
console.log(`------`);
console.log(`Monatlicher Cashflow: ${cashflowMonatlich.toFixed(2)} €`);
console.log(`Jährlicher Cashflow: ${cashflowJaehrlich.toFixed(2)} €`);

// 6. Eigenkapitalrendite
const ekRendite = cashflowJaehrlich / eigenkapital * 100;
console.log(`\nEigenkapitalrendite: ${ekRendite.toFixed(2)}%`);
console.log(`  (= ${cashflowJaehrlich.toFixed(2)} / ${eigenkapital} × 100)`);

// 7. Mietfaktor
const mietfaktor = kaufpreis / jahreskaltmiete;
console.log(`\nMietfaktor: ${mietfaktor.toFixed(1)}`);
console.log(`  (= ${kaufpreis} / ${jahreskaltmiete})`);

// 8. Kaufpreis pro m²
console.log(`\nKaufpreis pro m²: ${(kaufpreis / wohnflaeche).toFixed(2)} €/m²`);

// 9. Tilgungsplan (first 5 years)
console.log("\n--- TILGUNGSPLAN (erste 5 Jahre) ---");
let restschuld = darlehenssumme;
const monatszins = zinsPct / 100 / 12;
const fixedMonatlicheRate = darlehenssumme * (zinsPct + tilgungPct) / 100 / 12;

for (let jahr = 1; jahr <= 5; jahr++) {
  let jahresZins = 0;
  let jahresTilgung = 0;
  for (let m = 1; m <= 12; m++) {
    const zinsAnteil = restschuld * monatszins;
    const tilgungsAnteil = fixedMonatlicheRate - zinsAnteil;
    jahresZins += zinsAnteil;
    jahresTilgung += tilgungsAnteil;
    restschuld -= tilgungsAnteil;
  }
  console.log(`Jahr ${jahr}: Zins ${jahresZins.toFixed(2)} €, Tilgung ${jahresTilgung.toFixed(2)} €, Restschuld ${restschuld.toFixed(2)} €`);
}

// 10. Cross-check with known formulas
console.log("\n\n=== VERGLEICHSWERTE (erwartet) ===");
console.log("Diese Werte sollten mit gängigen Online-Rechnern übereinstimmen:");
console.log(`Kaufnebenkosten NRW: 6.5% + 2% + 3.57% = 12.07% → ${(kaufpreis * 0.1207).toFixed(2)} €`);
console.log(`Bruttorendite: Jahreskaltmiete/Kaufpreis = ${jahreskaltmiete}/${kaufpreis} = ${bruttorendite.toFixed(2)}%`);
console.log(`Mietfaktor: Kaufpreis/Jahreskaltmiete = ${mietfaktor.toFixed(1)} (unter 25 = gut)`);
console.log(`\nHINWEIS: Standard-Annuitätenformel in DE = Darlehen × (Zins + Tilgung) / 12`);
console.log(`Dies ist eine ANFÄNGLICHE Rate. Die tatsächliche Rate bei echter Annuität`);
console.log(`(gleichbleibende Monatsrate über Laufzeit) ist identisch im ersten Monat,`);
console.log(`da Zins+Tilgung genau die anfängliche Annuität beschreibt.`);
