import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import os from "os";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
const TENANTS_DIR = path.join(OPENCLAW_DIR, "tenants");

export interface TenantMember {
  id: string;
  name: string;
  email?: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string;
  status: "online" | "offline" | "idle";
  avatar?: string;
  color: string;
  isYou?: boolean;
}

export interface TenantRoom {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  createdAt: string;
  createdBy: string;
  members: TenantMember[];
  maxMembers: number;
  isPublic: boolean;
  currentSkin: string;
}

function loadTenants(): Record<string, TenantRoom> {
  if (!fs.existsSync(TENANTS_DIR)) {
    fs.mkdirSync(TENANTS_DIR, { recursive: true });
    return {};
  }
  try {
    const indexPath = path.join(TENANTS_DIR, "index.json");
    if (fs.existsSync(indexPath)) {
      return JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    }
  } catch {}
  return {};
}

function saveTenants(tenants: Record<string, TenantRoom>) {
  if (!fs.existsSync(TENANTS_DIR)) {
    fs.mkdirSync(TENANTS_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(TENANTS_DIR, "index.json"), JSON.stringify(tenants, null, 2));
}

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

// GET: list all tenants / get single tenant
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("id");

  const tenants = loadTenants();

  if (tenantId) {
    const tenant = tenants[tenantId];
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    return NextResponse.json({ tenant });
  }

  return NextResponse.json({ tenants: Object.values(tenants), total: Object.keys(tenants).length });
}

// POST: create or join tenant
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action: string = body.action || body._action || "create";

  const tenants = loadTenants();

  // Create new tenant room
  if (action === "create") {
    const { name, description, yourName } = body;
    if (!name || !yourName) {
      return NextResponse.json({ error: "name and yourName are required" }, { status: 400 });
    }

    const id = "room-" + Date.now().toString(36);
    const inviteCode = generateCode();

    const tenant: TenantRoom = {
      id,
      name,
      description: description || "",
      inviteCode,
      createdAt: new Date().toISOString(),
      createdBy: yourName,
      members: [
        {
          id: "you-" + Date.now().toString(36),
          name: yourName,
          role: "owner",
          joinedAt: new Date().toISOString(),
          status: "online",
          color: body.color || "#00d4aa",
          isYou: true,
        },
      ],
      maxMembers: 8,
      isPublic: false,
      currentSkin: "default",
    };

    tenants[id] = tenant;
    saveTenants(tenants);
    return NextResponse.json({ tenant, inviteCode }, { status: 201 });
  }

  // Join tenant by invite code
  if (action === "join") {
    const { inviteCode, yourName, color } = body;
    if (!inviteCode || !yourName) {
      return NextResponse.json({ error: "inviteCode and yourName are required" }, { status: 400 });
    }

    const tenant = Object.values(tenants).find((t) => t.inviteCode === inviteCode.toUpperCase());
    if (!tenant) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }
    if (tenant.members.length >= tenant.maxMembers) {
      return NextResponse.json({ error: "Room is full" }, { status: 409 });
    }

    const newMember: TenantMember = {
      id: "you-" + Date.now().toString(36),
      name: yourName,
      role: "member",
      joinedAt: new Date().toISOString(),
      status: "online",
      color: color || "#e94560",
      isYou: true,
    };

    // Remove "you" flag from existing members
    tenant.members = tenant.members.map((m) => ({ ...m, isYou: false }));
    tenant.members.push(newMember);
    saveTenants(tenants);

    return NextResponse.json({ tenant });
  }

  // Update tenant (name, skin, settings)
  if (action === "update") {
    const { tenantId, ...updates } = body;
    const tenant = tenants[tenantId];
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    Object.assign(tenant, updates);
    saveTenants(tenants);
    return NextResponse.json({ tenant });
  }

  // Regenerate invite code
  if (action === "regenerate-code") {
    const { tenantId } = body;
    const tenant = tenants[tenantId];
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

    tenant.inviteCode = generateCode();
    saveTenants(tenants);
    return NextResponse.json({ inviteCode: tenant.inviteCode });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
