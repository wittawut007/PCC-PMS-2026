"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Users, Layers3, CalendarDays, RefreshCw, Search, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { ProjectHistoryData } from "@/lib/project-history";
import { historyCategories } from "@/lib/project-history-config";
import "@/components/installation/installation-timeline.css";
import "./project-history.css";

const day = (at: string) => new Date(at).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
const date = (at: string) => new Date(at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
const kinds = [{ id: "create", label: "สร้าง / อัปโหลด" }, { id: "update", label: "แก้ไข / บันทึก" }, { id: "approve", label: "พิจารณา / อนุมัติ" }, { id: "reject", label: "ส่งกลับแก้ไข" }, { id: "delete", label: "ลบ" }, { id: "record", label: "รายการอ้างอิงเดิม" }];
const fieldNames: Record<string, string> = { title: "ชื่อรายการ", reference: "เลขอ้างอิง", before: "ก่อนเปลี่ยนแปลง", after: "หลังเปลี่ยนแปลง", status: "สถานะ", filename: "ชื่อไฟล์", category: "หมวดหมู่", comment: "ความเห็น", description: "รายละเอียด", plannedStart: "เริ่มตามแผน", plannedEnd: "สิ้นสุดตามแผน", responsible: "ผู้รับผิดชอบ", quantity: "จำนวน", unit: "หน่วย", location: "พื้นที่", activity: "กิจกรรม", logDate: "วันที่บันทึกงาน", goodQty: "รับดี", badQty: "ชำรุด", missingQty: "ขาด", actualQty: "รับจริง", decision: "ผลพิจารณา", correctiveAction: "วิธีแก้ไข", verificationNotes: "ผลตรวจยืนยัน", notes: "หมายเหตุ", replacedFile: "แทนที่ไฟล์", sourceType: "แหล่งไฟล์" };
function Fields({ data }: { data: unknown }) {
  if (data === null || data === undefined) return <span>—</span>;
  if (typeof data !== "object") return <span>{typeof data === "boolean" ? data ? "ใช่" : "ไม่ใช่" : String(data)}</span>;
  return <dl className="phis-fields">{Object.entries(data).map(([key, value]) => <div key={key}><dt>{fieldNames[key] || key}</dt><dd><Fields data={value} /></dd></div>)}</dl>;
}
type HistoryFilters = { category: string; query: string; actor: string; kind: string; source: string; from: string; to: string; sort: string };
const defaultFilters: HistoryFilters = { category: "all", query: "", actor: "all", kind: "all", source: "all", from: "", to: "", sort: "desc" };
export function ProjectHistoryView({ data }: { data: ProjectHistoryData }) {
  const router = useRouter();
  const [filters, setFilters] = useState<HistoryFilters>(defaultFilters);
  const [draft, setDraft] = useState<HistoryFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const { category, query, actor, kind, source, from, to, sort } = filters;
  const filterCount = Object.entries(filters).filter(([key, value]) => value !== defaultFilters[key as keyof HistoryFilters]).length;
  const updateDraft = (key: keyof HistoryFilters, value: string) => setDraft(current => ({ ...current, [key]: value }));
  const openFilters = () => { setDraft(filters); dialog.current?.showModal(); };
  const audit = data.events.filter(e => e.source === "audit");
  const actors = [...new Map(data.events.map(e => [e.actorId, e.actor])).entries()];
  const filtered = data.events.filter(e => (category === "all" || e.category === category) && (actor === "all" || e.actorId === actor) && (kind === "all" || e.kind === kind) && (source === "all" || e.source === source) && (!from || day(e.at) >= from) && (!to || day(e.at) <= to) && (!query.trim() || `${e.title} ${e.reference} ${e.actor} ${e.action} ${JSON.stringify(e.details)}`.toLowerCase().includes(query.trim().toLowerCase())));
  if (sort === "asc") filtered.reverse();
  const pages = Math.max(1, Math.ceil(filtered.length / 20)), current = Math.min(page, pages), visible = filtered.slice((current - 1) * 20, current * 20);
  const metrics = [
    { label: "กิจกรรมที่บันทึก", value: audit.length, note: "Log การทำงานจริงของโครงการ", color: "blue", Icon: History },
    { label: "กิจกรรมวันนี้", value: audit.filter(e => day(e.at) === day(data.generatedAt)).length, note: "นับตามเวลาไทย", color: "green", Icon: CalendarDays },
    { label: "ผู้ดำเนินการ", value: new Set(audit.map(e => e.actorId)).size, note: "ผู้ใช้ที่มีประวัติการทำรายการ", color: "purple", Icon: Users },
    { label: "หมวดที่มีการดำเนินการ", value: new Set(audit.map(e => e.category)).size, note: `จาก ${historyCategories.length} หมวดงาน`, color: "orange", Icon: Layers3 },
  ];
  return <section className="project-history installation-timeline" data-history-project={data.projectId}>
    <div className="iq-kpis">{metrics.map(({ label, value, note, color, Icon }) => <article key={label} className={`iq-kpi iq-kpi-${color}`}><span className="iq-symbol"><Icon size={21} /></span><span className="iq-label">{label}</span><strong>{value.toLocaleString("th-TH")}</strong><small title={note}>{note}</small><svg className="iq-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" /></svg></article>)}</div>
    <div className="phis-notice">แสดง Log ที่ระบบบันทึกจริง พร้อมรายการอ้างอิงเดิมซึ่งแยกป้ายกำกับไว้ ข้อมูลเดิมแสดงตามวันที่ของรายการ และไม่ใช่ประวัติการแก้ไขย้อนหลัง</div>
    <div className="phis-content">
    <div className="phis-results"><div><h3>ลำดับการดำเนินการ</h3><span role="status">แสดง {filtered.length ? (current - 1) * 20 + 1 : 0}–{Math.min(current * 20, filtered.length)} จาก {filtered.length} รายการ</span></div><button type="button" className={`phis-filter-trigger${filterCount ? " is-active" : ""}`} aria-label="เปิดตัวกรองประวัติ" title={filterCount ? `ใช้ตัวกรอง ${filterCount} เงื่อนไข` : "ตัวกรองประวัติ"} aria-haspopup="dialog" aria-controls="project-history-filters" onClick={openFilters}><SlidersHorizontal size={21} />{filterCount > 0 && <span className="phis-filter-count">{filterCount}</span>}</button></div>
    <ol className="phis-timeline">{visible.map((event, index) => <li key={event.id}><span className={`phis-dot phis-${event.kind}`} /><article><div className="phis-event-head"><div><span className={`phis-badge phis-${event.kind}`}>{event.action}</span><span className="phis-source">{event.source === "audit" ? "Log การทำงาน" : "รายการอ้างอิงเดิม"}</span></div><time dateTime={event.at}>{date(event.at)}</time></div><h4>{event.title}</h4><p>{historyCategories.find(c => c.id === event.category)?.label} · {event.reference || "ไม่ระบุเลขอ้างอิง"}</p><p>ผู้ดำเนินการ: <b>{event.actor}</b></p><details><summary>รายละเอียดการดำเนินการ <ChevronDown size={15} /></summary><Fields data={event.details} /><small>รหัสเหตุการณ์: {event.id} · {event.actionCode}</small></details></article>{index === visible.length - 1 ? null : <span className="phis-line" />}</li>)}</ol>
    {!visible.length && <div className="phis-empty">{data.events.length ? "ไม่พบกิจกรรมที่ตรงกับตัวกรอง" : "ยังไม่มีประวัติการดำเนินการของโครงการนี้"}</div>}
    {pages > 1 && <nav className="phis-pagination" aria-label="หน้าประวัติ"><button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>ก่อนหน้า</button><span>{current} / {pages}</span><button type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>ถัดไป</button></nav>}
    </div>
    <dialog ref={dialog} id="project-history-filters" className="phis-filter-dialog" aria-labelledby="phis-filter-title" onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close(); } }}>
      <form onSubmit={event => { event.preventDefault(); setFilters({ ...draft, query: draft.query.trim() }); setPage(1); dialog.current?.close(); }}>
        <header><div><SlidersHorizontal size={21} /><h3 id="phis-filter-title">ตัวกรองประวัติการดำเนินงาน</h3></div><button type="button" className="phis-close" aria-label="ปิดตัวกรอง" onClick={() => dialog.current?.close()}><X size={21} /></button></header>
        <div className="phis-filters">
          <label className="phis-search"><span className="sr-only">ค้นหาประวัติ</span><Search size={17} /><input type="search" aria-label="ค้นหาประวัติ" placeholder="ค้นหากิจกรรม เอกสาร ผู้ดำเนินการ..." value={draft.query} onChange={e => updateDraft("query", e.target.value)} /></label>
          <label>หมวดการดำเนินการ<select aria-label="หมวดการดำเนินการ" value={draft.category} onChange={e => updateDraft("category", e.target.value)}><option value="all">ทุกหมวด ({data.events.length})</option>{historyCategories.map(c => <option key={c.id} value={c.id}>{c.label} ({data.events.filter(e => e.category === c.id).length})</option>)}</select></label>
          <label>ผู้ดำเนินการ<select aria-label="ผู้ดำเนินการ" value={draft.actor} onChange={e => updateDraft("actor", e.target.value)}><option value="all">ทุกคน</option>{actors.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
          <label>ประเภทกิจกรรม<select aria-label="ประเภทกิจกรรม" value={draft.kind} onChange={e => updateDraft("kind", e.target.value)}><option value="all">ทุกประเภท</option>{kinds.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}</select></label>
          <label>แหล่งข้อมูล<select aria-label="แหล่งข้อมูล" value={draft.source} onChange={e => updateDraft("source", e.target.value)}><option value="all">ทั้งหมด</option><option value="audit">Log การทำงาน</option><option value="record">รายการอ้างอิงเดิม</option></select></label>
          <label>ตั้งแต่วันที่<input type="date" aria-label="ตั้งแต่วันที่" max={draft.to || undefined} value={draft.from} onChange={e => updateDraft("from", e.target.value)} /></label>
          <label>ถึงวันที่<input type="date" aria-label="ถึงวันที่" min={draft.from || undefined} value={draft.to} onChange={e => updateDraft("to", e.target.value)} /></label>
          <label>เรียงลำดับ<select aria-label="เรียงลำดับ" value={draft.sort} onChange={e => updateDraft("sort", e.target.value)}><option value="desc">ใหม่ไปเก่า</option><option value="asc">เก่าไปใหม่</option></select></label>
        </div>
        <footer><div><button type="button" className="phis-reset" onClick={() => setDraft({ ...defaultFilters })}>ล้างตัวกรอง</button><button type="button" className="phis-refresh" onClick={() => router.refresh()} title="โหลดประวัติล่าสุด"><RefreshCw size={16} />รีเฟรชข้อมูล</button></div><div><button type="button" className="phis-cancel" onClick={() => dialog.current?.close()}>ยกเลิก</button><button type="submit" className="phis-apply">ใช้ตัวกรอง</button></div></footer>
      </form>
    </dialog>
  </section>;
}
