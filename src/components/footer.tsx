import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card border-t pt-16 pb-8">
      <div className="w-full max-w-[1760px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col items-center gap-8">
         
          <div className="text-center space-y-4">
            <h3 className="font-theseasons text-4xl font-bold tracking-tight text-black leading-[1.1]">Antariya</h3>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Empowering India&apos;s embroidery industry with premium digital assets and machine solutions.
            </p>
          </div>

          <div className="border-t pt-8 w-full flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-muted-foreground">© 2026 Antariya India. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-xs text-muted-foreground hover:text-black transition-colors font-medium">Privacy Policy</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-black transition-colors font-medium">Terms of Service</Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-black transition-colors font-medium">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
