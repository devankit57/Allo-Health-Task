export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/reservation/:path*", "/user-reserved"]
};
