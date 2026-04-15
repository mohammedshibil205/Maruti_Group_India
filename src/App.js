import React, { useState, useEffect } from "react";
import * as supabaseJS from "@supabase/supabase-js";

const supabaseUrl = "https://fjrdsprrhlzieaovarba.supabase.co";
const supabaseKey = "sb_publishable_w8nb567mm2HhoJlxp4rhZw_FS0ud_eU";
const supabase = supabaseJS.createClient(supabaseUrl, supabaseKey);

export default function MarutiFinalApp() {
  const [user] = useState("Mohammed Shibil");
  const [items, setItems] = useState([
    {
      desc: "Fabrication and Supply of Lift Door Wide Jambs",
      uom: "Sets",
      qty: 18,
      price: 35000,
    },
  ]);
  const [to, setTo] = useState({
    name: "Mr. Naveen",
    desig: "Project Manager",
    co: "Rajapushpa Realty, Hyderabad",
  });
  const [refNo, setRefNo] = useState("MEMC-RAJAPUSHPA-00445-REV.02");
  const [isKarnataka, setIsKarnataka] = useState(false);
  const [history, setHistory] = useState([]);
  const [terms, setTerms] = useState({
    val: "15 days",
    proc: "15-20 days",
    fab: "20-25 days",
    del: "5-7 days",
    ins: "10-15 days",
    payS: "30% advance, 65% on delivery, 5% with installation",
    payI: "30% Advance, 70% upon completion",
  });

  const sub = items.reduce((a, b) => a + b.qty * b.price, 0);
  const tax = isKarnataka
    ? { c: sub * 0.09, s: sub * 0.09, i: 0 }
    : { c: 0, s: 0, i: sub * 0.18 };

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  };

  const saveToCloud = async () => {
    const quote = {
      created_by: user,
      ref_no: refNo,
      client_details: `${to.name}|${to.desig}|${to.co}`,
      items,
      is_karnataka: isKarnataka,
      grand_total: sub + tax.c + tax.s + tax.i,
      terms,
    };
    const { error } = await supabase
      .from("quotations")
      .upsert(quote, { onConflict: "ref_no" });
    if (error) alert(error.message);
    else {
      alert("SUCCESS: Saved to Maruti Cloud Repository!");
      fetchHistory();
    }
  };

  const deleteQuote = async (id, creator) => {
    if (creator !== user)
      return alert("ACCESS DENIED: Only the creator can delete this quote.");
    if (window.confirm("Are you sure you want to delete this quote?")) {
      await supabase.from("quotations").delete().eq("id", id);
      fetchHistory();
    }
  };

  // --- THIS IS THE DUPLICATE LOGIC ---
  const duplicate = (q) => {
    const [n, d, c] = q.client_details.split("|");
    setTo({ name: n || "", desig: d || "", co: c || "" });
    setItems(q.items);
    setRefNo(q.ref_no + "-REV");
    setTerms(q.terms);
    setIsKarnataka(q.is_karnataka);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans text-slate-800 pb-20">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl border-t-8 border-[#f47321]">
        {/* HEADER */}
        <div className="p-8 flex justify-between border-b">
          <div>
            <h1 className="text-4xl font-black text-slate-800 uppercase italic">
              Maruti Group
            </h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em]">
              UAE | KSA | QATAR | INDIA
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-[#f47321]">QUOTATION</h2>
            <input
              className="text-right border-b w-64 outline-none font-mono text-sm bg-transparent"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
            />
          </div>
        </div>

        {/* CLOUD CONTROLS */}
        <div className="px-8 py-3 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex gap-2">
            <button
              onClick={() => setIsKarnataka(false)}
              className={`px-4 py-1 rounded text-[10px] font-bold ${
                !isKarnataka ? "bg-[#f47321]" : "bg-slate-700"
              }`}
            >
              INTERSTATE (IGST)
            </button>
            <button
              onClick={() => setIsKarnataka(true)}
              className={`px-4 py-1 rounded text-[10px] font-bold ${
                isKarnataka ? "bg-[#f47321]" : "bg-slate-700"
              }`}
            >
              KARNATAKA (9+9%)
            </button>
          </div>
          <button
            onClick={saveToCloud}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-1 rounded font-bold text-[10px] transition shadow-lg"
          >
            ☁ SAVE DRAFT TO CLOUD
          </button>
        </div>

        {/* TO ADDRESS */}
        <div className="p-8 bg-slate-50 border-b space-y-1">
          <input
            className="block w-full font-bold text-lg bg-transparent outline-none"
            value={to.name}
            onChange={(e) => setTo({ ...to, name: e.target.value })}
            placeholder="Recipient Name"
          />
          <input
            className="block w-full text-sm bg-transparent outline-none"
            value={to.desig}
            onChange={(e) => setTo({ ...to, desig: e.target.value })}
            placeholder="Designation"
          />
          <input
            className="block w-full text-sm bg-transparent outline-none uppercase text-slate-400"
            value={to.co}
            onChange={(e) => setTo({ ...to, co: e.target.value })}
            placeholder="Company Name"
          />
        </div>

        {/* ITEMS TABLE */}
        <div className="p-8">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 uppercase font-bold text-slate-500">
              <tr>
                <th className="p-2">Description</th>
                <th className="p-2 w-16 text-center">UoM</th>
                <th className="p-2 w-16 text-center">Qty</th>
                <th className="p-2 w-24 text-right">Price</th>
                <th className="p-2 w-32 text-right">Total</th>
                <th className="p-2 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="py-2">
                    <textarea
                      className="w-full outline-none bg-transparent resize-none leading-snug"
                      rows="2"
                      value={item.desc}
                      onChange={(e) => {
                        const n = [...items];
                        n[i].desc = e.target.value;
                        setItems(n);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full text-center outline-none bg-transparent font-semibold"
                      value={item.uom}
                      onChange={(e) => {
                        const n = [...items];
                        n[i].uom = e.target.value;
                        setItems(n);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full text-center outline-none bg-transparent"
                      type="number"
                      value={item.qty}
                      onChange={(e) => {
                        const n = [...items];
                        n[i].qty = e.target.value;
                        setItems(n);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full text-right outline-none bg-transparent font-mono"
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const n = [...items];
                        n[i].price = e.target.value;
                        setItems(n);
                      }}
                    />
                  </td>
                  <td className="text-right font-bold italic">
                    ₹ {(item.qty * item.price).toLocaleString("en-IN")}
                  </td>
                  <td className="text-center print:hidden">
                    <button
                      onClick={() =>
                        setItems(items.filter((_, idx) => idx !== i))
                      }
                      className="text-red-300 hover:text-red-600 font-bold transition"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() =>
              setItems([...items, { desc: "", uom: "Sets", qty: 1, price: 0 }])
            }
            className="mt-4 text-[10px] font-bold text-[#f47321] print:hidden uppercase"
          >
            + Add Item
          </button>
        </div>

        {/* TOTALS */}
        <div className="p-8 border-t flex justify-end bg-slate-50/50">
          <div className="w-64 text-xs space-y-1">
            <div className="flex justify-between font-bold uppercase">
              <span>Sub-Total:</span>
              <span>₹ {sub.toLocaleString("en-IN")}</span>
            </div>
            {isKarnataka ? (
              <>
                <div className="flex justify-between italic text-slate-500">
                  <span>CGST (9%):</span>
                  <span>₹ {tax.c.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between italic text-slate-500">
                  <span>SGST (9%):</span>
                  <span>₹ {tax.s.toLocaleString("en-IN")}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between italic text-slate-500">
                <span>IGST (18%):</span>
                <span>₹ {tax.i.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black text-[#f47321] border-t-2 border-[#f47321] pt-2 mt-2">
              <span>Grand Total:</span>
              <span>
                ₹ {(sub + tax.c + tax.s + tax.i).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* TIMELINE & TERMS */}
        <div className="p-8 grid grid-cols-2 gap-8 border-t text-[10px] bg-slate-50/20">
          <div className="space-y-4">
            <h4 className="font-bold border-b pb-1 uppercase tracking-widest text-slate-800 underline">
              Project Timeline (Days)
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <span>
                Procurement:{" "}
                <input
                  className="w-16 border-b outline-none bg-transparent"
                  value={terms.proc}
                  onChange={(e) => setTerms({ ...terms, proc: e.target.value })}
                />
              </span>
              <span>
                Fabrication:{" "}
                <input
                  className="w-16 border-b outline-none bg-transparent"
                  value={terms.fab}
                  onChange={(e) => setTerms({ ...terms, fab: e.target.value })}
                />
              </span>
              <span>
                Delivery:{" "}
                <input
                  className="w-16 border-b outline-none bg-transparent"
                  value={terms.del}
                  onChange={(e) => setTerms({ ...terms, del: e.target.value })}
                />
              </span>
              <span>
                Installation:{" "}
                <input
                  className="w-16 border-b outline-none bg-transparent"
                  value={terms.ins}
                  onChange={(e) => setTerms({ ...terms, ins: e.target.value })}
                />
              </span>
            </div>
            <div className="pt-2">
              <span>
                Validity:{" "}
                <input
                  className="w-40 border-b outline-none bg-transparent"
                  value={terms.val}
                  onChange={(e) => setTerms({ ...terms, val: e.target.value })}
                />
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold border-b pb-1 uppercase tracking-widest text-slate-800 underline">
              Payment Terms
            </h4>
            <p className="font-bold text-slate-400 uppercase text-[8px] mb-1">
              Supply (PO):
            </p>
            <textarea
              className="w-full text-[9px] outline-none h-10 bg-transparent italic"
              value={terms.payS}
              onChange={(e) => setTerms({ ...terms, payS: e.target.value })}
            />
            <p className="font-bold text-slate-400 uppercase text-[8px] mb-1">
              Installation (WO):
            </p>
            <textarea
              className="w-full text-[9px] outline-none h-10 bg-transparent italic"
              value={terms.payI}
              onChange={(e) => setTerms({ ...terms, payI: e.target.value })}
            />
          </div>
        </div>

        {/* ACTION */}
        <div className="p-6 bg-slate-50 text-right print:hidden border-t">
          <button
            onClick={() => window.print()}
            className="bg-[#f47321] text-white px-12 py-3 rounded font-black uppercase text-xs shadow-xl"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* --- REPOSITORY (DUPLICATE BUTTON IS HERE) --- */}
      <div className="max-w-5xl mx-auto mt-12 print:hidden pb-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">
          Maruti Shared Cloud Repository
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {history.map((q) => (
            <div
              key={q.id}
              className="bg-white p-5 rounded-lg shadow hover:shadow-lg border-l-4 border-[#f47321] transition"
            >
              <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase mb-2">
                <span>BY: {q.created_by}</span>
                <span>{new Date(q.created_at).toLocaleDateString()}</span>
              </div>
              <h4 className="font-bold text-xs truncate text-slate-700 mb-1">
                {q.ref_no}
              </h4>
              <p className="text-[#f47321] font-black text-sm">
                ₹ {q.grand_total.toLocaleString("en-IN")}
              </p>

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                {/* THIS IS THE BUTTON YOU ARE LOOKING FOR */}
                <button
                  onClick={() => duplicate(q)}
                  className="flex-1 bg-slate-800 hover:bg-black text-white text-[9px] font-bold py-2 rounded uppercase transition"
                >
                  Duplicate / Revise
                </button>
                {q.created_by === user && (
                  <button
                    onClick={() => deleteQuote(q.id, q.created_by)}
                    className="px-3 text-red-400 font-bold hover:text-red-600 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
