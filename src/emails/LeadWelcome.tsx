import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface LeadWelcomeEmailProps {
  lead: { name?: string; firstName?: string; lastName?: string; service?: string };
}

const LeadWelcomeEmail = ({ lead }: LeadWelcomeEmailProps) => {
  const fullName = lead.firstName ? `${lead.firstName} ${lead.lastName || ""}`.trim() : lead.name || "there";

  return (
    <Html>
      <Head />
      <Preview>Thanks for reaching out to Concord — we&apos;ve got you covered.</Preview>
      <Body className="bg-white font-sans">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto px-[20px] py-[30px] w-[465px]">
          <Section className="mt-[32px]">
            <Text className="text-[24px] font-light text-center px-[20px] py-[14px]">
              <span className="text-[#4A4A4A]">Hi {fullName},</span>
            </Text>
            <Text className="text-[14px] leading-[24px] text-[#44403c]">
              Thanks for contacting Concord! We received your request and one of our irrigation specialists will be in touch shortly to discuss your project.
            </Text>
            {lead.service && (
              <Text className="text-[14px] leading-[24px] text-[#44403c]">
                <strong>Service requested:</strong> {lead.service}
              </Text>
            )}
          </Section>
          <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
          <Section className="text-center">
            <Text className="text-[14px] leading-[24px] text-[#44403c]">
              Have questions in the meantime? Just reply to this email or call us at{" "}
              <a href="tel:+17048864240" className="text-[#0070f3] no-underline">
                (704) 886-4240
              </a>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

LeadWelcomeEmail.Subject = "Thanks for contacting Concord — we've got you covered";
LeadWelcomeEmail.PreviewText = "Thanks for reaching out to Concord — we've got you covered.";

export default LeadWelcomeEmail;
