import { PublicFormRenderer } from "@/components/forms/public-form-renderer";

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

type DynamicBlockProps = {
  props?: Record<string, unknown>;
};

export function ManagedFormEmbedBlock({ props = {} }: DynamicBlockProps) {
  const formSlug = text(props.formSlug, text(props.slug, "contact-form"));
  return (
    <div className="mx-auto max-w-3xl py-4">
      <PublicFormRenderer slug={formSlug} />
    </div>
  );
}

export function ContactFormBlock(_props: DynamicBlockProps = {}) {
  return (
    <div className="mx-auto max-w-3xl py-4">
      <PublicFormRenderer slug="contact-form" />
    </div>
  );
}
