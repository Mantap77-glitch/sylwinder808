import { NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/lib/api/api-endpoints";
import { BackendApiError, serverApi } from "@/lib/api/server-api";
import { getAdminSession } from "@/lib/auth/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


function getBackendMessage(error: unknown, fallback: string) {
  if (error instanceof BackendApiError) {
    const detail = error.detail as {
      error?: unknown;
      message?: unknown;
      errors?: unknown;
    } | null;


    if (typeof detail?.error === "string") {
      return detail.error;
    }

    if (typeof detail?.message === "string") {
      return detail.message;
    }


    if (
      Array.isArray(detail?.errors) &&
      typeof detail.errors[0] === "string"
    ) {
      return detail.errors[0];
    }


    return error.message || fallback;
  }


  if (error instanceof Error) {
    return error.message;
  }


  return fallback;
}


function getBackendStatus(
  error: unknown,
  fallback = 400
) {
  if (error instanceof BackendApiError) {
    return error.status >= 400
      ? error.status
      : fallback;
  }

  return fallback;
}


async function getClientAdminSession() {
  const session = await getAdminSession();


  if (
    session.isSuperAdmin ||
    session.role === "SUPER_ADMIN" ||
    !session.tenantId ||
    !session.token
  ) {
    return null;
  }


  return session;
}


export async function GET() {
  try {
    const session = await getClientAdminSession();


    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak.",
        },
        {
          status: 403,
        }
      );
    }


    const result = await serverApi(
      API_ENDPOINTS.admin.brandingSetting,
      {
        method: "GET",
        token: session.token,
      }
    );


    return NextResponse.json(result);


  } catch(error) {

    console.error(
      "GET_BRANDING_PROXY_ERROR:",
      error
    );


    return NextResponse.json(
      {
        success:false,
        message:getBackendMessage(
          error,
          "Gagal mengambil branding."
        ),
      },
      {
        status:getBackendStatus(error,400),
      }
    );
  }
}



export async function PATCH(req: Request) {
  try {
    const session = await getClientAdminSession();


    if (!session) {
      return NextResponse.json(
        {
          success:false,
          message:"Akses ditolak.",
        },
        {
          status:403,
        }
      );
    }


    /**
     * Terima multipart dari browser
     * dan teruskan ke backend.
     *
     * Backend yang handle:
     * - validasi file
     * - upload Cloudinary
     * - simpan database
     */

    const formData = await req.formData();


    const siteName = String(
      formData.get("siteName") || ""
    ).trim();


    if (!siteName) {
      return NextResponse.json(
        {
          success:false,
          message:"Nama situs wajib diisi.",
        },
        {
          status:400,
        }
      );
    }



    const result = await serverApi(
      API_ENDPOINTS.admin.brandingSetting,
      {
        method:"PATCH",
        token:session.token,
        body:formData,
      }
    );


    return NextResponse.json(result);


  } catch(error) {

    console.error(
      "UPDATE_BRANDING_PROXY_ERROR:",
      error
    );


    return NextResponse.json(
      {
        success:false,
        message:getBackendMessage(
          error,
          "Gagal menyimpan branding."
        ),
      },
      {
        status:getBackendStatus(error,400),
      }
    );
  }
}