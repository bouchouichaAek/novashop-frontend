const Footer = () => {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container mx-auto py-10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} NovaShop. All rights reserved.</p>
        <nav className="flex gap-6">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Support</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
