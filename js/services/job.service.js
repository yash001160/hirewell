/* Job service: owns job records, search/filter rules and validation. */
(function (HW) {
  const KEY = "hirewell:jobs", D = HW.DAY, now = Date.now();
  const seed = [
    [1, "Frontend Developer", "Northwind Labs", "Engineering", "Full-time", "Remote", 95000, "Build responsive interfaces with HTML, CSS and JavaScript for our analytics product.", true, 1],
    [2, "Product Designer", "Studio Palma", "Design", "Contract", "Chandigarh", 70000, "Own the design system and shape mobile flows from research to handoff.", true, 3],
    [3, "Growth Marketer", "Brightpath", "Marketing", "Full-time", "Delhi", 62000, "Plan and run lifecycle campaigns across email, social and paid channels.", true, 5],
    [4, "Accounts Analyst", "Ledgerly", "Finance", "Part-time", "Ludhiana", 38000, "Reconcile accounts, prepare monthly reports and support audits.", true, 8],
    [5, "Sales Associate", "Kiteworks", "Sales", "Full-time", "Remote", 48000, "Qualify inbound leads and run product demos for small businesses.", true, 9],
    [6, "Operations Intern", "Parcelo", "Operations", "Internship", "Mumbai", 18000, "Support warehouse planning, track shipments and improve daily dashboards.", true, 12],
    [7, "Backend Engineer", "Northwind Labs", "Engineering", "Full-time", "Bengaluru", 120000, "Design APIs and data pipelines that serve millions of requests a day.", false, 20]
  ].map(r => ({ id: r[0], title: r[1], company: r[2], cat: r[3], type: r[4], loc: r[5], sal: r[6], desc: r[7], open: r[8], posted: now - r[9] * D, owner: "seed" }));

  let jobs = HW.storage.get(KEY, null) || seed;
  let next = jobs.reduce((m, j) => Math.max(m, j.id), 0) + 1;
  const save = () => HW.storage.set(KEY, jobs);
  const uniq = k => [...new Set(jobs.map(j => j[k]))].sort();

  HW.jobs = {
    all: () => jobs,
    get: id => jobs.find(j => j.id === id),
    types: () => uniq("type"),
    locations: () => uniq("loc"),
    byOwner: email => jobs.filter(j => j.owner === email),
    openByCategory: () => HW.CATS.map(c => [c, jobs.filter(j => j.open && j.cat === c).length]),
    list({ q = "", cat = "", type = "", loc = "", sort = "new" }) {
      q = q.trim().toLowerCase();
      const out = jobs.filter(j => (!cat || j.cat === cat) && (!type || j.type === type) && (!loc || j.loc === loc) &&
        (!q || (j.title + " " + j.company + " " + j.desc).toLowerCase().includes(q)));
      out.sort((a, b) => sort === "sal" ? b.sal - a.sal : sort === "az" ? a.title.localeCompare(b.title) : b.posted - a.posted);
      return out;
    },
    validate(v) {
      const e = {};
      if (!v.title) e.jTitle = "Enter a job title.";
      if (!v.company) e.jCompany = "Enter the company name.";
      if (!v.loc) e.jLoc = "Enter a location.";
      if (v.sal === "" || +v.sal < 0) e.jSal = "Enter a salary of 0 or more.";
      if (v.desc.length < 20) e.jDesc = "Write at least 20 characters.";
      return e;
    },
    create(data, owner) { const j = { id: next++, ...data, sal: +data.sal, owner, open: true, posted: Date.now() }; jobs.push(j); save(); HW.bus.emit("jobs:changed"); return j; },
    update(id, data) { Object.assign(jobs.find(j => j.id === id), data, { sal: +data.sal }); save(); HW.bus.emit("jobs:changed"); },
    toggle(id) { const j = HW.jobs.get(id); j.open = !j.open; save(); HW.bus.emit("jobs:changed"); return j.open; },
    remove(id) { jobs = jobs.filter(j => j.id !== id); save(); HW.bus.emit("jobs:removed", id); HW.bus.emit("jobs:changed"); }
  };
})(window.HW);
