import { NextResponse } from "next/server";
import os from "os";

function getSystemStats() {
  const cpuCount = os.cpus().length;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const uptime = os.uptime();

  // CPU usage (average of all cores)
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  }
  const cpuUsage = totalTick > 0 ? ((1 - totalIdle / totalTick) * 100).toFixed(1) : "0";

  return {
    cpu: {
      cores: cpuCount,
      usage: parseFloat(cpuUsage),
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usedPercent: parseFloat(((usedMem / totalMem) * 100).toFixed(1)),
    },
    uptime: uptime,
  };
}

export async function GET() {
  try {
    const stats = getSystemStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to get system stats" }, { status: 500 });
  }
}
