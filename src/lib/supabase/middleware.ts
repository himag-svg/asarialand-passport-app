import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Redirect unauthenticated users to login (except auth routes)
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth routes
  if (user && isAuthRoute) {
    // Fetch role to determine redirect target
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "client";
    const url = request.nextUrl.clone();
    url.pathname = role === "client" ? "/dashboard" : "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // Role-based route protection for authenticated users
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "client";
    const isAdminRoute = pathname.startsWith("/admin");
    const isClientRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/new-request") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/payments") ||
      pathname.startsWith("/request");

    // Clients cannot access admin routes
    if (isAdminRoute && role === "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Staff accessing root should go to admin dashboard
    if (pathname === "/" && role !== "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    // Client accessing root should go to client dashboard
    if (pathname === "/" && role === "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
