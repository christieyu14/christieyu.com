import { redirect } from "next/navigation";

export default function HeroAlbumRedirectPage() {
  redirect("/photos");
}
