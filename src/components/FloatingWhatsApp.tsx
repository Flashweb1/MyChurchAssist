"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = "2349070885530";
  const whatsappMessage = encodeURIComponent(
    "Hi! I'm interested in learning more about Church Assist. Can you help me?"
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Menu Items */}
        {isOpen && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="space-y-3 min-w-[280px]">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">How can we help?</h3>
                <p className="text-xs text-slate-500 mt-1">Chat with us on WhatsApp for quick assistance</p>
              </div>

              <Link
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.411-2.389-1.473-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371 0-.57 0-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.955 1.269c-1.533.805-2.96 2.002-4.028 3.409C2.884 10.806 2.256 12.76 2.256 15.023c0 .766.111 1.512.32 2.221l.5 1.6 1.721 4.56c.15.398.505.686.923.686.104 0 .212-.013.318-.04l5.331-.856c.82.164 1.67.248 2.53.248 2.262 0 4.215-.628 5.622-1.696 1.408-.068 2.747-1.177 3.815-2.253 1.068-1.076 1.73-2.407 1.93-3.808.199-1.401.004-2.902-.564-4.163-.568-1.261-1.515-2.301-2.714-2.954-1.199-.654-2.689-.983-4.208-.983-2.26 0-4.213.628-5.622 1.696-1.408-1.068-3.147-1.695-5.041-1.695z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">WhatsApp</p>
                  <p className="text-xs text-slate-500">Fastest response</p>
                </div>
              </Link>

              <a
                href="mailto:flashwebtechnology@gmail.com"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Email</p>
                  <p className="text-xs text-slate-500">flashwebtechnology@gmail.com</p>
                </div>
              </a>

              <a
                href="tel:+2349070885530"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.707 12.293l-5.293-5.293a1 1 0 00-1.414 1.414L15.586 12l-4.586 4.586a1 1 0 101.414 1.414l5.293-5.293a1 1 0 000-1.414zM6.707 12.293l5.293-5.293a1 1 0 011.414 1.414L8.414 12l4.586 4.586a1 1 0 11-1.414 1.414l-5.293-5.293a1 1 0 010-1.414z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Call</p>
                  <p className="text-xs text-slate-500">+234 907 088 5530</p>
                </div>
              </a>
            </div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            isOpen
              ? "bg-slate-700 hover:bg-slate-800"
              : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          }`}
          aria-label="Customer Support"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </button>

        {/* Badge */}
        {!isOpen && (
          <div className="bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-slate-100 animate-bounce">
            Need Help?
          </div>
        )}
      </div>
    </>
  );
}
