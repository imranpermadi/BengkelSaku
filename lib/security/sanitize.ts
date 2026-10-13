// OWASP ASI-01: Prompt Injection & Input Validation Protection

const INJECTION_PATTERNS = [
  /ignore\s+(previous|all)\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+an?\s+unrestricted/i,
  /jailbreak/i,
  /<script[\s\S]*?>/i,
  /eval\s*\(/i,
  /drop\s+table/i,
  /union\s+select/i,
];

export interface ValidationResult {
  isValid: boolean;
  sanitizedText: string;
  rejectionReason?: string;
}

export function validateAutomotiveComplaint(input: string): ValidationResult {
  if (!input || typeof input !== "string") {
    return {
      isValid: false,
      sanitizedText: "",
      rejectionReason: "Deskripsi keluhan wajib diisi.",
    };
  }

  const trimmed = input.trim();

  if (trimmed.length < 5) {
    return {
      isValid: false,
      sanitizedText: "",
      rejectionReason: "Deskripsi keluhan terlalu singkat (minimal 5 karakter).",
    };
  }

  if (trimmed.length > 2000) {
    return {
      isValid: false,
      sanitizedText: "",
      rejectionReason: "Deskripsi keluhan melebihi batas 2000 karakter.",
    };
  }

  // Cek deteksi Prompt Injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        sanitizedText: "",
        rejectionReason:
          "Input terdeteksi mengandung pola yang tidak diizinkan demi keamanan sistem.",
      };
    }
  }

  // Sanitasi karakter kontrol non-printable
  const sanitized = trimmed.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "");

  return {
    isValid: true,
    sanitizedText: sanitized,
  };
}
