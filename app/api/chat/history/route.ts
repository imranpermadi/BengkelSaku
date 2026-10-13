import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

async function resolveUser(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (dbUser) return dbUser;
    }
  } catch (err) {
    console.warn("[AUTH API SESSION RESOLVE]:", err);
  }

  const url = new URL(req.url);
  const emailOrId = url.searchParams.get("userKey") || url.searchParams.get("email");

  if (emailOrId && emailOrId !== "default" && emailOrId !== "default_user") {
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: emailOrId }, { email: emailOrId }],
      },
    });

    if (!dbUser) {
      const email = emailOrId.includes("@") ? emailOrId : `${emailOrId}@bengkelsaku.local`;
      const name = emailOrId.includes("@") ? emailOrId.split("@")[0] : emailOrId;
      dbUser = await prisma.user.create({
        data: { email, name },
      });
    }
    return dbUser;
  }

  let fallbackUser = await prisma.user.findFirst();
  if (!fallbackUser) {
    fallbackUser = await prisma.user.create({
      data: {
        email: "pemilik@bengkelsaku.id",
        name: "Pemilik Mobil BengkelSaku",
      },
    });
  }
  return fallbackUser;
}

// GET /api/chat/history - Ambil riwayat percakapan TORQ AI dari database
export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      sender: m.role as "user" | "bot",
      text: m.content,
      timestamp: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ messages: formatted });
  } catch (error: any) {
    console.error("[GET /api/chat/history ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal mengambil riwayat chat", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/chat/history - Simpan pesan percakapan ke database
export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    const body = await req.json();

    // Dukung batch migration dari localStorage
    if (Array.isArray(body.messages)) {
      const createdList = [];
      for (const m of body.messages) {
        const created = await prisma.chatMessage.create({
          data: {
            userId: user.id,
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text || m.content || "",
          },
        });
        createdList.push(created);
      }
      return NextResponse.json({ success: true, count: createdList.length });
    }

    const { sender, text, content } = body;
    const messageContent = text || content;

    if (!messageContent) {
      return NextResponse.json({ error: "Isi pesan tidak boleh kosong." }, { status: 400 });
    }

    const created = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: sender === "user" ? "user" : "assistant",
        content: messageContent,
      },
    });

    return NextResponse.json({ success: true, message: created }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/chat/history ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pesan ke database", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/history - Bersihkan riwayat chat pengguna
export async function DELETE(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 401 });
    }

    await prisma.chatMessage.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Riwayat percakapan berhasil dibersihkan." });
  } catch (error: any) {
    console.error("[DELETE /api/chat/history ERROR]:", error);
    return NextResponse.json(
      { error: "Gagal menghapus riwayat chat", details: error.message },
      { status: 500 }
    );
  }
}

