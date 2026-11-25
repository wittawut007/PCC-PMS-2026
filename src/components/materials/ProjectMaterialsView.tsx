"use client";

import { Fragment, useMemo, useState } from "react";
import { Package, CheckCircle2, Warehouse, Factory } from "lucide-react";
import type { ProjectMaterialOverview, ProjectMaterialRow } from "@/lib/project-materials";
import "./project-materials.css";

const number = (value: number | null) => value === null ? "รอยืนยัน" : value.toLocaleString("th-TH", { maximumFractionDigits: 3 });
const statuses: Record<string, string> = { PENDING: "รอผลิต", PRODUCING: "กำลังผลิต", READY: "ผลิตพร้อมส่ง", SCHEDULED: "จัดเที่ยวแล้ว", LOADING: "กำลังโหลด", IN_TRANSIT: "กำลังขนส่ง", ARRIVED: "ถึงหน้างาน", COMPLETED: "ส่งมอบแล้ว" };

function materialStatus(row: ProjectMaterialRow) {
  if (!row.approved) return "ตรวจสอบฐาน BOM";
  if (row.outstanding === 0) return "รับดีครบแล้ว";
  if (row.toProduce !== null && row.toProduce > 0) return "ต้องสั่งผลิตเพิ่ม";
  if (row.toProcure !== null && row.toProcure > 0) return "ต้องจัดหา / ตรวจสอบคลัง";
  if (row.producing > 0 || row.ordered > 0) return "ติดตามการผลิต / ส่งมอบ";
  return "รอส่งมอบ / ตรวจรับ";
}

export function ProjectMaterialsView({ projectId, overview }: { projectId: string; overview: ProjectMaterialOverview }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const rows = useMemo(() => overview.rows.filter(row => {
    const text = [row.code, row.name, row.spec, row.packageName, row.reference, ...row.requests].join(" ").toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (filter === "all" || (filter === "delivered" && row.received > 0) || (filter === "procure" && (row.toProcure || 0) > 0) || (filter === "production" && (row.ordered > 0 || (row.toProduce || 0) > 0)));
  }), [overview.rows, query, filter]);
  const counts = [
    { label: "วัสดุทั้งหมด", value: overview.rows.length, tone: "blue", Icon: Package },
    { label: "วัสดุรับดีแล้ว", value: overview.rows.filter(row => row.received > 0).length, tone: "green", Icon: CheckCircle2 },
    { label: "ยังต้องจัดหา", value: overview.rows.filter(row => (row.toProcure || 0) > 0).length, tone: "orange", Icon: Warehouse },
    { label: "ต้องสั่งผลิตเพิ่ม", value: overview.rows.filter(row => (row.toProduce || 0) > 0).length, tone: "red", Icon: Factory },
  ];

  return (
    <section className="project-materials" data-project-materials={projectId}>
      <div className="pmat-summary">
        {counts.map(({ label, value, tone, Icon }) => (
          <div key={label} className={`pmat-kpi ${tone}`}>
            <div className="pmat-kpi-icon"><Icon size={21} aria-hidden="true" /></div>
            <span>{label}</span>
            <strong>{value}<small>รายการ</small></strong>
            <svg className="pmat-wave" viewBox="0 0 260 36" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 30 Q50 38 90 18 T180 15 T260 6 V36 H0Z" />
            </svg>
          </div>
        ))}
      </div>
      <div className="pmat-filters">
        <input type="search" aria-label="ค้นหาวัสดุโครงการ" placeholder="ค้นหาชื่อ รหัสวัสดุ ชุดงาน หรือคำขอ..." value={query} onChange={event => setQuery(event.target.value)} />
        <select aria-label="กรองสถานะวัสดุโครงการ" value={filter} onChange={event => setFilter(event.target.value)}>
          <option value="all">วัสดุทั้งหมด</option><option value="delivered">มีวัสดุรับดีแล้ว</option><option value="procure">ยังต้องจัดหา</option><option value="production">การผลิต / สั่งผลิตเพิ่มเติม</option>
        </select>
        <small role="status">แสดง {rows.length} จาก {overview.rows.length} รายการ</small>
      </div>
      <div className="pmat-table-wrap">
        <table>
          <thead><tr><th>วัสดุ / หน่วย</th><th>ต้องใช้</th><th>ส่งมอบ / รับดี</th><th>ยังต้องรับดี</th><th>ยังต้องจัดหา</th><th>การผลิต</th><th>สถานะ</th></tr></thead>
          <tbody>
            {rows.map(row => (
              <Fragment key={row.id}>
                <tr data-material-code={row.code}>
                  <td><strong className="pmat-material-name">{row.name}</strong><small>{row.code} · หน่วย{row.unit}</small><small>{row.packageName}</small>{!row.approved && <em>รอตรวจสอบ BOM อนุมัติ</em>}</td>
                  <td><strong className="pmat-value">{number(row.required)}</strong></td>
                  <td><strong className="pmat-value pmat-good">{number(row.received)}</strong><small>รับดี · ส่งมอบ {number(row.delivered)}</small></td>
                  <td><strong className="pmat-value">{number(row.outstanding)}</strong></td>
                  <td><strong className={`pmat-value ${(row.toProcure || 0) > 0 ? "pmat-warning" : ""}`}>{number(row.toProcure)}</strong></td>
                  <td><strong className="pmat-value">{number(row.producing)}</strong><small>กำลังผลิต · สั่งแล้ว {number(row.ordered)}</small><span className={`pmat-production ${(row.toProduce || 0) > 0 ? "pmat-warning" : ""}`}>{row.toProduce === null ? "รอคลังยืนยันส่วนขาด" : `สั่งเพิ่ม ${number(row.toProduce)}`}</span></td>
                  <td><b className={`pmat-status ${row.outstanding === 0 ? "complete" : (row.toProcure || 0) > 0 ? "pending" : "in-progress"}`}>{materialStatus(row)}</b><button className="pmat-details-toggle" type="button" aria-expanded={expandedId === row.id} aria-controls={`material-details-${row.id}`} onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}>{expandedId === row.id ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}</button></td>
                </tr>
                {expandedId === row.id && (
                  <tr className="pmat-detail-row"><td colSpan={7} id={`material-details-${row.id}`}>
                    <div className="pmat-detail-grid">
                      <div><h3>วัสดุและแบบ</h3><p>{row.spec || "ยังไม่ระบุสเปก"}</p><p>{row.reference}</p></div>
                      <div><h3>การจัดสรร</h3><p>ขอแล้ว {number(row.requested)} {row.unit}</p><p>คลังจัดสรร {number(row.allocated)} {row.unit}</p>{row.confirmedDemand === 0 && <p>ยังไม่มีผลยืนยันคลัง</p>}<p>โรงงานพร้อมส่ง {number(row.ready)} {row.unit}</p></div>
                      <div><h3>ขนส่งและตรวจรับ</h3><p>ส่งมอบ {number(row.delivered)} · รับดี {number(row.received)} {row.unit}</p><p>ชำรุด {number(row.damaged)} · ขาด {number(row.missing)} {row.unit}</p><p>จัดเที่ยวรอส่ง {number(row.scheduled)} {row.unit}</p><p>กำลังขนส่ง/รอตรวจรับ {number(row.inTransit)} {row.unit}</p></div>
                      <div><h3>เอกสารอ้างอิง</h3><p>คำขอ {row.requests.join(", ") || "ยังไม่มีคำขอ"}</p>
                        {row.deliveries.map(trip => <p key={trip.reference}>{trip.reference} · {statuses[trip.status] || trip.status} · {number(trip.quantity)} {row.unit}<br />{trip.good === null ? "ยังไม่มีผลตรวจรับ" : `รับดี ${number(trip.good)} / ชำรุด ${number(trip.bad)} / ขาด ${number(trip.missing)}`}</p>)}
                        {row.orders.map(order => <p key={order.reference}>{order.reference} · {statuses[order.status] || order.status} · {number(order.quantity)} {row.unit}<br />กำหนดพร้อม {order.date ? new Date(order.date).toLocaleDateString("th-TH") : "รอยืนยัน"}</p>)}
                        {row.deliveries.length + row.orders.length === 0 && <p>ยังไม่มีเที่ยวส่งมอบหรือใบสั่งผลิต</p>}
                      </div>
                    </div>
                  </td></tr>
                )}
              </Fragment>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="pmat-empty">{overview.rows.length ? "ไม่พบวัสดุที่ตรงกับตัวกรอง" : "ยังไม่มี BOM หรือรายการวัสดุของโครงการนี้"}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="pmat-note">ยอดรับดีอ้างอิงใบตรวจรับ ส่วนที่ต้องจัดหาแสดงหลังหักยอดจัดสรรและใบสั่งผลิตที่ยังมีผล</p>
      {overview.unresolved.length > 0 && <div className="pmat-unresolved"><h3>รายการรอตรวจสอบการผูกวัสดุ</h3>{overview.unresolved.map(item => <p key={item}>{item}</p>)}</div>}
    </section>
  );
}
