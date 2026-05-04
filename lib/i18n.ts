/**
 * Simple i18n configuration for FlowTime.
 * Centralizing strings for consistency and future localization support.
 */

export const i18n = {
  fr: {
    common: {
      cancel: "Annuler",
      save: "Enregistrer",
      send: "Envoyer",
      delete: "Supprimer",
      edit: "Modifier",
      loading: "Chargement...",
      error: "Une erreur est survenue",
      success: "Opération réussie",
    },
    auth: {
      login: "Connexion Staff",
      email: "Adresse email",
      magicLink: "Lien magique",
      sendLink: "Envoyer le lien",
    },
    admin: {
      dashboard: "Tableau de bord",
      employees: "Employés",
      planning: "Plannings",
      validation: "Validation heures",
      payroll: "Export paie",
      stats: {
        active: "Actifs aujourd'hui",
        pending: "À valider",
        totalHours: "Heures semaine",
        cost: "Coût estimé",
      }
    },
    employee: {
      declareHours: "Déclarer mes heures",
      myHours: "Mes Heures",
      myProfile: "Mon Profil",
      status: {
        pending: "En attente",
        validated: "Validé",
        rejected: "Refusé",
      }
    }
  }
} as const;

export type TranslationKeys = typeof i18n.fr;

/**
 * Helper to get translations (defaults to French).
 */
export const t = () => i18n.fr;
