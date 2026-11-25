"use client";

import { useEffect, useRef, useState } from "react";
import { X, Pencil, Trash2, UploadCloud, FileText } from "lucide-react";
import type { ProjectDocument } from "@/lib/project-documents";
import { projectPhotoCategories } from "@/lib/project-photo-config";
import { documentCategories } from "@/lib/document-library-config";

export type DocumentManagerMode = "upload" | "menu" | "edit" | "delete";
export function DocumentFileManager({ mode, document, projectId, category, imageOnly = false, close, changeMode, saved }: { imageOnly?: boolean; mode: DocumentManagerMode; document: ProjectDocument | null; projectId: string; category: string; close: () => void; changeMode: (mode: DocumentManagerMode) => void; saved: (message: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(document?.title || "");
  useEffect(() => { ref.current?.showModal(); }, []);
  const heading = mode === "upload" ? imageOnly ? "อัปโหลดรูปภาพโครงการ" : "อัปโหลดเอกสารใหม่" : mode === "edit" ? "แก้ไขรายละเอียด / เปลี่ยนไฟล์" : mode === "delete" ? "ยืนยันการลบไฟล์" : "จัดการไฟล์เอกสาร";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const data = new FormData(event.currentTarget);
      const file = data.get("file");
      if (imageOnly && file instanceof File && !/\.(png|jpe?g|webp|gif)$/i.test(file.name)) throw new Error("กรุณาเลือกไฟล์รูปภาพ JPG, PNG, WebP หรือ GIF");
      if (file instanceof File && file.size > 25 * 1024 * 1024) throw new Error("กรุณาเลือกไฟล์ขนาดไม่เกิน 25 MB");
      if (mode !== "upload" && !document?.manage) throw new Error("ไม่พบข้อมูลรายการไฟล์ กรุณาโหลดหน้าใหม่");
      if (document?.manage) data.set("target", JSON.stringify(document.manage));
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/documents`, mode === "delete" ? { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: document?.manage }) } : { method: mode === "upload" ? "POST" : "PATCH", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ไม่สามารถบันทึกไฟล์ได้");
      saved(mode === "delete" ? "ลบไฟล์แนบออกจากโครงการแล้ว" : mode === "upload" ? "อัปโหลดเอกสารเรียบร้อยแล้ว" : "บันทึกการแก้ไขเอกสารเรียบร้อยแล้ว");
    } catch (error) { setError(error instanceof Error ? error.message : "ไม่สามารถดำเนินการได้ กรุณาลองอีกครั้ง"); setBusy(false); }
  }
  return <dialog ref={ref} className="pdcs-dialog pdcs-manager" aria-labelledby="pdcs-manager-title" onClose={close} onCancel={event => { if (busy) event.preventDefault(); else close(); }}><header><div><span>คลังเอกสารโครงการ</span><h3 id="pdcs-manager-title">{heading}</h3>{document && <p>{document.title}</p>}</div><button type="button" aria-label="ปิดหน้าจัดการเอกสาร" disabled={busy} onClick={close}><X size={22} /></button></header>
    {mode === "menu" ? <div className="pdcs-manager-menu"><button type="button" onClick={() => changeMode("edit")}><Pencil size={20} /><span>แก้ไขรายละเอียด / เปลี่ยนไฟล์<small>แก้ชื่อ หมวดหมู่ หรือแนบไฟล์ใหม่แทน</small></span></button><button type="button" className="pdcs-delete-action" onClick={() => changeMode("delete")}><Trash2 size={20} /><span>ลบไฟล์ออกจากโครงการ<small>ลบไฟล์แนบหรือชื่ออ้างอิง โดยเอกสารต้นทางยังอยู่</small></span></button></div> : <form onSubmit={submit}>
      <div className="pdcs-dialog-content">{mode === "delete" ? <div className="pdcs-delete-confirm"><Trash2 size={32} /><h4>ต้องการลบ “{document?.title}” ใช่หรือไม่?</h4><p>ไฟล์แนบหรือชื่อไฟล์อ้างอิงนี้จะถูกนำออกจากคลังเอกสารของโครงการ โดยใบตรวจรับ บันทึกงาน และเอกสารต้นทางยังอยู่</p></div> : <div className="pdcs-upload-fields">
        <label className="pdcs-form-wide">{mode === "upload" ? imageOnly ? "ไฟล์รูปภาพ *" : "ไฟล์เอกสาร *" : "เปลี่ยนไฟล์แนบ (เลือกเมื่อต้องการแทนไฟล์เดิม)"}<input name="file" type="file" required={mode === "upload"} disabled={busy} accept={imageOnly ? ".png,.jpg,.jpeg,.webp,.gif" : ".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.dwg,.dxf"} onChange={event => { const file = event.target.files?.[0]; if (file && !title) setTitle(file.name); }} /><small>{imageOnly ? "JPG, PNG, WebP, GIF · ไม่เกิน 25 MB" : "PDF, Office, รูปภาพ, CSV, TXT, ZIP, DWG/DXF · ไม่เกิน 25 MB"}</small>{mode === "edit" && document?.filename && <small>ไฟล์ปัจจุบัน: {document.filename}</small>}</label>
        <label className="pdcs-form-wide">{imageOnly ? "ชื่อรูปภาพ *" : "ชื่อเอกสาร *"}<input name="title" value={title} onChange={event => setTitle(event.target.value)} maxLength={250} required disabled={busy} /></label>
        <label className="pdcs-form-wide">หมวดหมู่ *<select aria-label="หมวดหมู่เอกสาร" name="category" defaultValue={document?.category || (category === "all" ? "general" : category)} disabled={busy}>{(imageOnly ? projectPhotoCategories.map(c => ({ id: c.documentCategory, name: c.name })) : documentCategories).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>เลขที่ / เอกสารอ้างอิง<input name="reference" defaultValue={document?.reference || ""} maxLength={200} disabled={busy} /></label><label>Revision<input name="revision" defaultValue={document?.revision || ""} maxLength={30} disabled={busy} /></label>
        <label className="pdcs-form-wide">รายละเอียดเพิ่มเติม<textarea name="description" defaultValue={document?.description || ""} maxLength={5000} rows={3} disabled={busy} /></label>
      </div>}{error && <div className="pdcs-form-error" role="alert">{error}</div>}</div>
      <footer><button type="button" disabled={busy} onClick={close}>ยกเลิก</button><button className={mode === "delete" ? "pdcs-confirm-delete" : "pdcs-confirm-save"} type="submit" disabled={busy}>{mode === "delete" ? <Trash2 size={16} /> : mode === "upload" ? <UploadCloud size={17} /> : <FileText size={16} />}{busy ? "กำลังดำเนินการ…" : mode === "delete" ? "ยืนยันลบไฟล์" : mode === "upload" ? imageOnly ? "อัปโหลดรูปภาพ" : "อัปโหลดเอกสาร" : "บันทึกการแก้ไข"}</button></footer>
    </form>}
  </dialog>;
}
