"use client";

import { useRouter } from "next/navigation";
import { DocumentFileManager, type DocumentManagerMode } from "./DocumentFileManager";
import { useEffect, useRef, useState } from "react";
import { Folder, FileText, Search, CheckCircle2, Clock3, Paperclip, ChevronRight, X, ExternalLink, ShieldCheck, Plus, MoreVertical } from "lucide-react";
import type { ProjectDocument, ProjectDocumentsData } from "@/lib/project-documents";
import "./project-documents.css";

const labels: Record<string, string> = { APPROVED: "อนุมัติแล้ว", PASSED: "อนุมัติแล้ว", CONFIRMED: "ยืนยันแล้ว", COMPLETED: "เสร็จสิ้น", PUBLISHED: "เผยแพร่แล้ว", CLOSED: "ปิดแล้ว", DRAFT: "ฉบับร่าง", SUBMITTED: "ส่งพิจารณาแล้ว", UNDER_REVIEW: "รอพิจารณา", PENDING: "รอดำเนินการ", WAITING: "รอดำเนินการ", WAITING_PREV: "รอจุดอนุมัติก่อนหน้า", NOT_STARTED: "ยังไม่เริ่ม", REJECTED: "ไม่ผ่าน / ต้องแก้ไข", RE_INSPECT: "รอตรวจซ้ำ", OPEN: "เปิดข้อบกพร่อง", IN_PROGRESS: "กำลังดำเนินการ", PENDING_REVIEW: "รอตรวจการแก้ไข", RECORDED: "บันทึกแล้ว", PRODUCING: "กำลังผลิต", READY: "พร้อมส่ง", SCHEDULED: "วางแผนขนส่ง", LOADING: "กำลังโหลด", IN_TRANSIT: "กำลังขนส่ง", ARRIVED: "ถึงหน้างาน", CANCELLED: "ยกเลิก", PARTIAL: "รับบางส่วน", INVOICED: "ออกเรียกเก็บแล้ว", PARTIALLY_PAID: "รับชำระบางส่วน", PAID: "บันทึกชำระครบ", DISPUTED: "มีข้อโต้แย้ง" };
const approved = (status: string) => ["APPROVED", "PASSED", "CONFIRMED", "COMPLETED", "PUBLISHED", "CLOSED", "PAID"].includes(status);
const pending = (status: string) => ["SUBMITTED", "UNDER_REVIEW", "PENDING_REVIEW", "RE_INSPECT", "WAITING", "PENDING"].includes(status);
const tone = (status: string) => approved(status) ? "green" : ["OPEN", "REJECTED", "DISPUTED"].includes(status) ? "red" : pending(status) || ["PARTIAL", "PARTIALLY_PAID"].includes(status) ? "orange" : ["DRAFT", "NOT_STARTED", "CANCELLED"].includes(status) ? "gray" : status === "WAITING_PREV" ? "purple" : "blue";
const date = (value: string) => new Date(value).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" });
const bytes = (size: number | null) => size === null ? "ยังไม่ระบุขนาด" : size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
function Badge({ status }: { status: string }) { return <span className={`pdcs-badge pdcs-${tone(status)}`}>{labels[status] || status}</span>; }

export function ProjectDocumentsView({ data }: { data: ProjectDocumentsData }) {
  const router = useRouter();
  const [manager, setManager] = useState<{ mode: DocumentManagerMode; document: ProjectDocument | null } | null>(null);
  const [message, setMessage] = useState("");
  const manage = (document: ProjectDocument) => { setMessage(""); setManager({ mode: "menu", document }); };
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<ProjectDocument | null>(null);
  const documents = data.documents;
  const categoryName = (id: string) => data.categories.find(c => c.id === id)?.name || "เอกสารทั่วไป";
  const scoped = documents.filter(d => category === "all" || d.category === category);
  const q = query.trim().toLowerCase();
  const rows = scoped.filter(d => (!fromDate || new Date(d.date).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }) >= fromDate) && (!toDate || new Date(d.date).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" }) <= toDate) && (!q || `${d.title} ${d.reference} ${d.revision || ""} ${d.filename || ""} ${categoryName(d.category)}`.toLowerCase().includes(q)) && (kind === "all" || kind === d.kind || kind === "available" && d.kind === "file" && d.href) && (status === "all" || status === "approved" && approved(d.status) || status === "pending" && pending(d.status) || status === "draft" && d.status === "DRAFT"));
  const selectCategory = (id: string) => setCategory(id);
  const clear = () => { setQuery(""); setKind("all"); setStatus("all"); setFromDate(""); setToDate(""); };
  const records = documents.filter(d => d.kind === "record");
  const metrics = [
    { label: "เอกสารทั้งหมด", value: documents.length.toLocaleString("th-TH"), note: "ไฟล์และเอกสารจากรายการในระบบ", color: "blue", Icon: Folder },
    { label: "เอกสารอนุมัติ / ยืนยันแล้ว", value: records.filter(d => approved(d.status)).length.toLocaleString("th-TH"), note: "ตามสถานะรายการที่บันทึกจริง", color: "green", Icon: CheckCircle2 },
    { label: "รออนุมัติ / พิจารณา", value: records.filter(d => pending(d.status)).length.toLocaleString("th-TH"), note: "รายการรอตรวจและพิจารณา", color: "orange", Icon: Clock3 },
    { label: "เอกสาร QC", value: documents.filter(d => ["qc", "ncr"].includes(d.category)).length.toLocaleString("th-TH"), note: "IR / QC · จุดอนุมัติ · NCR", color: "blue", Icon: ShieldCheck },
  ];
  return <section className="project-documents" data-documents-project={data.projectId}>
    <div className="pdcs-kpis">{metrics.map(({ label, value, note, color, Icon }) => <div key={label} className={`pdcs-kpi pdcs-kpi-${color}`}><span className="pdcs-symbol"><Icon size={21} /></span><span className="pdcs-label">{label}</span><strong>{value}</strong><small title={note}>{note}</small><svg className="pdcs-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" /></svg></div>)}</div>
    <header className="pdcs-heading"><div className="pdcs-heading-actions"><span className="pdcs-total">{documents.length} รายการทั้งหมด</span>{data.canManage && <button type="button" className="pdcs-upload-button" onClick={() => { setMessage(""); setManager({ mode: "upload", document: null }); }}><Plus size={20} />อัปโหลดเอกสารใหม่</button>}</div></header>
    {message && <div className="pdcs-success" role="status">{message}</div>}
    <div className="pdcs-layout"><aside className="pdcs-sidebar"><h3>หมวดหมู่เอกสาร</h3><nav aria-label="หมวดหมู่เอกสารโครงการ"><button type="button" aria-pressed={category === "all"} onClick={() => selectCategory("all")} className={category === "all" ? "pdcs-active" : ""}><Folder size={19} /><span>เอกสารทั้งหมด<small>{documents.length} รายการ</small></span></button>{data.categories.map(c => <button type="button" key={c.id} aria-pressed={category === c.id} onClick={() => selectCategory(c.id)} className={category === c.id ? "pdcs-active" : ""}><Folder size={19} /><span>{c.name}<small>{documents.filter(d => d.category === c.id).length} รายการ</small></span></button>)}</nav></aside>
      <div className="pdcs-main"><div className="pdcs-breadcrumb"><button type="button" onClick={() => selectCategory("all")}>คลังเอกสาร</button><ChevronRight size={14} /><span>{category === "all" ? "ทุกหมวดหมู่" : categoryName(category)}</span></div>

        <div className="pdcs-panel"><div className="pdcs-panel-title"><h3>คลังเอกสารโครงการ</h3><span className="pdcs-muted">แสดง {rows.length} จาก {scoped.length} รายการ</span></div><div className="pdcs-controls"><label className="pdcs-search"><Search size={18} /><input aria-label="ค้นหาเอกสารโครงการ" type="search" placeholder="ค้นหาชื่อเอกสาร เลขที่ หรือ Revision…" value={query} onChange={e => setQuery(e.target.value)} /></label><select aria-label="กรองรูปแบบเอกสาร" value={kind} onChange={e => setKind(e.target.value)}><option value="all">ทุกรูปแบบ</option><option value="record">เอกสารในระบบ</option><option value="file">ไฟล์แนบ / อ้างอิง</option><option value="available">มีไฟล์หรือลิงก์ให้เปิด</option></select><select aria-label="กรองสถานะเอกสาร" value={status} onChange={e => setStatus(e.target.value)}><option value="all">ทุกสถานะ</option><option value="approved">อนุมัติ / ยืนยันแล้ว</option><option value="pending">รอตรวจ / พิจารณา</option><option value="draft">ฉบับร่าง</option></select><label className="pdcs-date-filter">ตั้งแต่<input type="date" aria-label="เอกสารตั้งแต่วันที่" value={fromDate} max={toDate || undefined} onChange={e => setFromDate(e.target.value)} /></label><label className="pdcs-date-filter">ถึง<input type="date" aria-label="เอกสารถึงวันที่" value={toDate} min={fromDate || undefined} onChange={e => setToDate(e.target.value)} /></label><button type="button" className="pdcs-link" onClick={clear}>ล้างตัวกรอง</button></div>
          <div className="pdcs-table-wrap"><table><thead><tr><th>ชื่อเอกสาร / เลขที่</th><th>หมวดหมู่ / Revision</th><th>วันที่ / ผู้บันทึก</th><th>สถานะ</th><th>รูปแบบ</th><th>ดำเนินการ</th></tr></thead><tbody>{rows.map(d => <tr key={d.id} data-document-id={d.id}><td><div className="pdcs-file-title">{d.kind === "file" ? <Paperclip size={18} /> : <FileText size={18} />}<div><strong>{d.title}</strong><small>{d.reference}</small></div></div></td><td><span>{categoryName(d.category)}</span>{d.revision && <small>Rev.{d.revision}</small>}</td><td><span>{date(d.date)}</span><small>{d.by || "ยังไม่ระบุผู้บันทึก"}</small></td><td><Badge status={d.status} /></td><td>{d.kind === "record" ? "รายการในระบบ" : "ไฟล์แนบ"}{d.kind === "file" && <small>{d.href ? "มีไฟล์ / ลิงก์" : "มีชื่ออ้างอิง ยังไม่มีไฟล์ให้เปิด"}</small>}</td><td><div className="pdcs-row-actions"><button type="button" className="pdcs-open" onClick={() => setSelected(d)}>ดูรายละเอียด</button>{data.canManage && d.kind === "file" && d.manage && <button type="button" className="pdcs-file-actions" aria-label={`จัดการไฟล์ ${d.title}`} onClick={() => manage(d)}><MoreVertical size={19} /></button>}</div></td></tr>)}</tbody></table></div>{!rows.length && <div className="pdcs-empty" role="status">ไม่พบเอกสารตามหมวดหมู่หรือตัวกรองที่เลือก</div>}<p className="pdcs-note">รายการในระบบเปิดอ่านรายละเอียดได้ ส่วนไฟล์แนบจะแสดงปุ่มเปิดไฟล์เมื่อมีไฟล์หรือลิงก์ที่บันทึกไว้ สถานะไฟล์แนบอ้างอิงเอกสารต้นทาง</p>
        </div>
      </div>
      <aside className="pdcs-recent" aria-label="เอกสารล่าสุดของโครงการ"><h3>เอกสารล่าสุด</h3>{documents.slice(0, 5).map(d => <article key={d.id}>{d.href ? <a className="pdcs-recent-item" href={d.href} target="_blank" rel="noopener noreferrer">{d.title}</a> : <button type="button" className="pdcs-recent-item" onClick={() => setSelected(d)}>{d.title}</button>}</article>)}{!documents.length && <p className="pdcs-muted">ยังไม่มีเอกสาร</p>}</aside>
    </div>
    {manager && <DocumentFileManager key={`${manager.mode}-${manager.document?.id || "new"}`} mode={manager.mode} document={manager.document} projectId={data.projectId} category={category} close={() => setManager(null)} changeMode={mode => setManager({ ...manager, mode })} saved={text => { setManager(null); setMessage(text); router.refresh(); }} />}
    {selected && <DocumentPreview document={selected} category={categoryName(selected.category)} close={() => setSelected(null)} />}
  </section>;
}
function DocumentPreview({ document: d, category, close }: { document: ProjectDocument; category: string; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="pdcs-dialog" aria-labelledby="pdcs-document-title" onClose={close} onCancel={close}><header><div><span>{category}</span><h3 id="pdcs-document-title">{d.title}</h3><p>{d.reference}{d.revision ? ` · Revision ${d.revision}` : ""}</p></div><button type="button" aria-label="ปิดรายละเอียดเอกสาร" onClick={close}><X size={22} /></button></header><div className="pdcs-dialog-content"><Badge status={d.status} /><dl className="pdcs-document-meta"><div><dt>วันที่บันทึก / ปรับปรุง</dt><dd>{date(d.date)}</dd></div><div><dt>ผู้บันทึก / ผู้รับผิดชอบ</dt><dd>{d.by || "ยังไม่ระบุ"}</dd></div><div><dt>รูปแบบ</dt><dd>{d.kind === "file" ? `ไฟล์แนบ · ${bytes(d.size)}` : "เอกสารจากรายการในระบบ"}</dd></div></dl>{d.description && <p className="pdcs-description">{d.description}</p>}{d.fields.length > 0 && <dl className="pdcs-document-fields">{d.fields.map((field, index) => <div key={index}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl>}{d.kind === "file" && !d.href && <div className="pdcs-file-unavailable">มีชื่อไฟล์อ้างอิง “{d.filename}” แต่ยังไม่มีไฟล์จัดเก็บที่เปิดได้ในระบบ</div>}{d.href && <a className="pdcs-download" href={d.href} target="_blank" rel="noopener noreferrer"><ExternalLink size={17} />เปิดไฟล์แนบ</a>}</div><footer><button type="button" onClick={close}>ปิด</button></footer></dialog>;
}
