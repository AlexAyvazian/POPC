import {loadMasterSectors,normalizeSectorRows} from './master-sectors.js';
(() => {
  "use strict";
  const currency = new Intl.NumberFormat("en-US", {style:"currency",currency:"USD"});
  const escape = (v) => String(v ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const money = (cents) => currency.format(Number(cents) / 100);
  const displayDate = (date) => {
    const p = String(date || "").split("-");
    return p.length === 3 ? p[1] + "/" + p[2] + "/" + p[0] : escape(date);
  };
  const pdf = (image) => /^\d{15,20}$/.test(String(image)) ? `https://docquery.fec.gov/cgi-bin/fecimg/?${image}` : null;
  const source = (image) => {
    const link = pdf(image);
    return link ? `<a class="jvf-fec-link" href="${link}" target="_blank" rel="noopener noreferrer">FEC filing</a>` : "—";
  };
  const employer = (v) => {
    const t=String(v||"").trim();
    return !t || /^(N\/A|NULL)$/i.test(t) ? "Not reported" : t;
  };
  const employerSort = (v) => {
    const e=employer(v);
    return e==="Not reported" ? "ZZZZZZZZZZZ" : e.toUpperCase();
  };
  function table(headers,rows,extraClass="") {
    const h=headers.map(x=>`<th scope="col">${escape(x)}</th>`).join("");
    return `<div class="jvf-table-wrap"><table class="jvf-table ${extraClass}"><thead><tr>${h}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  }
  function orgRow(r) {
    const [name,,date,cents,,note,image,form,entity] = r;
    const type=entity==="PAC"?"Political Action Committee":entity==="CCM"?"Candidate Committee":"Organization";
    const details=note ? `<small class="jvf-row-note">${escape(note)}</small>`:"";
    return `<tr><td class="jvf-contributor">${escape(name)}${details}</td><td>${escape(type)}</td><td class="jvf-nowrap">${displayDate(date)}</td><td class="jvf-money">${money(cents)}</td><td>${source(image)}</td></tr>`;
  }
  function individualRow(r, previousEmployer) {
    const [name,company,occupation,date,cents,flag,note,image] = r;
    const e=employer(company);
    const newGroup=previousEmployer!==employerSort(company);
    const details=note ? `<small class="jvf-row-note">${escape(note)}</small>` : "";
    return `<tr${newGroup?' class="jvf-new-employer"':''}><td class="jvf-contributor">${escape(name)}${details}</td><td>${escape(e)}</td><td>${escape(occupation||"—")}</td><td class="jvf-nowrap">${displayDate(date)}</td><td class="jvf-money">${money(cents)}</td><td>${source(image)}</td></tr>`;
  }
  async function start(){
    await loadMasterSectors();
    const status=document.getElementById("jvf-status");
    try {
      const paths=["/data/jeffries/dvtlf-individuals-1.json","/data/jeffries/dvtlf-individuals-2.json","/data/jeffries/dvtlf-individuals-3.json","/data/jeffries/dvtlf-individuals-4.json","/data/jeffries/dvtlf-individuals-5.json","/data/jeffries/dvtlf-individuals-6.json","/data/jeffries/dvtlf-individuals-7.json","/data/jeffries/dvtlf-individuals-8.json","/data/jeffries/dvtlf-individuals-9.json","/data/jeffries/dvtlf-individuals-10.json","/data/jeffries/dvtlf-individuals-11.json","/data/jeffries/dvtlf-individuals-12.json","/data/jeffries/dvtlf-individuals-13.json","/data/jeffries/dvtlf-organizations.json","/data/jeffries/dvtlf-employers.json"];
      const data=await Promise.all(paths.map(async path=>{
        const response=await fetch(path);
        if(!response.ok)throw new Error("Unable to load "+path);
        return normalizeSectorRows(await response.json(),path);
      }));
      const individuals=data.slice(0,-2).flat();
      const orgs=data.at(-2);
      const employers=data.at(-1);
      if(individuals.length!==1262||orgs.length!==5||employers.length!==14)throw new Error("The FEC data files are incomplete.");
      const directOrgs=orgs.filter(x=>!x[4]);
      const orgMemo=orgs.filter(x=>x[4]);
      const directIndividuals=individuals.filter(x=>!x[5]);
      const individualMemo=individuals.filter(x=>x[5]);
      const orgTotal=directOrgs.reduce((n,x)=>n+x[3],0);
      const indTotal=directIndividuals.reduce((n,x)=>n+x[4],0);
      if(orgTotal!==0||indTotal!==4067000||employers.reduce((n,r)=>n+r[2],0)!==indTotal)throw new Error("Contribution totals did not reconcile.");
      const summary=document.getElementById("jvf-summary");
      summary.textContent=`${directOrgs.length} organization/committee records (${money(orgTotal)}) · ${directIndividuals.length} individual records (${money(indTotal)}) · FEC itemized receipts, 2025–2026`;
      const sections=new Map();
      for(const r of directOrgs){const sector=r[1];if(!sections.has(sector))sections.set(sector,[]);sections.get(sector).push(r);}
      const sectors=[...sections].sort(([a],[b])=>a.localeCompare(b)).map(([sector,rows])=>{
        rows.sort((a,b)=>a[0].localeCompare(b[0])||a[2].localeCompare(b[2]));
        const total=rows.reduce((n,r)=>n+r[3],0);
        const caption=`<h2>${escape(sector)}</h2><p class="jvf-section-meta">${rows.length} ${rows.length===1?"record":"records"} · ${money(total)}</p>`;
        return `<section class="jvf-sector-section">${caption}${table(["Organization / committee","FEC classification","Date","Amount","Source"],rows.map(orgRow))}</section>`;
      }).join("");
      document.getElementById("jvf-sectors").innerHTML=sectors || "<p>No direct organizational or political committee receipts appear in the uploaded records.</p>";
      const employerSections=new Map();
      for(const r of employers){if(!employerSections.has(r[1]))employerSections.set(r[1],[]);employerSections.get(r[1]).push(r);}
      document.getElementById("jmf-employers").innerHTML=[...employerSections].sort(([a],[b])=>a.localeCompare(b)).map(([sector,rows])=>{
        rows.sort((a,b)=>b[2]-a[2]||a[0].localeCompare(b[0]));
        const caption=`<h2>${escape(sector)}</h2><p class="jvf-section-meta">${rows.length} reported employers/statuses · ${money(rows.reduce((n,r)=>n+r[2],0))}</p>`;
        return `<section class="jvf-sector-section">${caption}${table(["Reported employer / status","Direct individual receipts","Individual receipt total"],rows.map(r=>`<tr><td class="jvf-contributor">${escape(r[0])}</td><td>${r[3]}</td><td class="jvf-money">${money(r[2])}</td></tr>`))}</section>`;
      }).join("");
      const sorter=(a,b)=>employerSort(a[1]).localeCompare(employerSort(b[1]))||a[0].localeCompare(b[0])||a[3].localeCompare(b[3]);
      directIndividuals.sort(sorter);
      let last=null;
      const rows=directIndividuals.map(r=>{const html=individualRow(r,last);last=employerSort(r[1]);return html;});
      document.getElementById("jvf-individuals").innerHTML=table(["Individual donor","Reported employer","Reported occupation","Date","Amount","Source"],rows,"jvf-individual-table");
      individualMemo.sort(sorter);
      let memoLast=null;
      const memoRows=individualMemo.map(r=>{const html=individualRow(r,memoLast);memoLast=employerSort(r[1]);return html;});
      document.getElementById("jvf-organization-memo").innerHTML=table(["Earmarking intermediary","FEC classification","Date","Memo amount","Source"],orgMemo.map(orgRow));
      document.getElementById("jvf-memo-summary").textContent=`${orgMemo.length} ActBlue intermediary entries are displayed below without adding them to contribution totals.`;
      status.remove();
    } catch(err) {
      status.textContent="Unable to load the contribution tables. Please reload this page.";
      console.error("Defend the Vote Leadership Fund data loading failed:",err);
    }
  }
  start();
})();