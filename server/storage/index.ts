import { ActivityStorage } from "./activity.storage";
import { CmsMediaStorage } from "./cms-media.storage";
import { CmsMenusStorage } from "./cms-menus.storage";
import { CmsPageRevisionsStorage } from "./cms-page-revisions.storage";
import { CmsPagesStorage } from "./cms-pages.storage";
import { CmsSectionsStorage } from "./cms-sections.storage";
import { CmsSidebarsStorage } from "./cms-sidebars.storage";
import { DocsStorage } from "./docs.storage";
import { EditorLocksStorage } from "./editor-locks.storage";
import { EmailTemplateStorage } from "./email-template.storage";
import { FormsStorage } from "./forms.storage";
import { PasswordResetStorage } from "./password-reset.storage";
import { RedirectsStorage } from "./redirects.storage";
import { SeoSettingsStorage } from "./seo-settings.storage";
import { SettingsStorage } from "./settings.storage";
import { UserStorage } from "./user.storage";

export const storage = {
  users: new UserStorage(),
  passwordResets: new PasswordResetStorage(),
  activity: new ActivityStorage(),
  settings: new SettingsStorage(),
  emailTemplates: new EmailTemplateStorage(),
  docs: new DocsStorage(),
  cmsPages: new CmsPagesStorage(),
  cmsPageRevisions: new CmsPageRevisionsStorage(),
  cmsMedia: new CmsMediaStorage(),
  cmsSections: new CmsSectionsStorage(),
  cmsMenus: new CmsMenusStorage(),
  cmsSidebars: new CmsSidebarsStorage(),
  forms: new FormsStorage(),
  editorLocks: new EditorLocksStorage(),
  seoSettings: new SeoSettingsStorage(),
  redirects: new RedirectsStorage(),
};
