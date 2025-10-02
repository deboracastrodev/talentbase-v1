export function Footer() {
  return (
    <footer className="bg-blue-600 py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between text-white gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">TB</span>
            </div>
            <span className="font-semibold">talentbase</span>
          </div>
          <div className="text-sm text-center md:text-right">
            © 2025 TalentBase. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
