import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface InternalLeadAlertEmailProps {
  lead: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    service?: string;
    urgency?: string;
    notes?: string;
  };
}

const InternalLeadAlertEmail = ({ lead }: InternalLeadAlertEmailProps) => {
  const fullName = lead.firstName ? `${lead.firstName} ${lead.lastName || ""}`.trim() : lead.name || "New Lead";

  return (
    <Html>
      <Head />
      <Preview>New lead alert from the Concord website</Preview>
      <Body className="bg-white font-sans">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto px-[20px] py-[30px] w-[560px]">
          <Section className="mb-[24px] bg-[#fef3c7] rounded p-[16px]">
            <Text className="text-[16px] font-semibold text-[#92400e]">
              New Lead Received
            </Text>
            <Text className="text-[14px] text-[#92400e]">
              A new lead has come through the website. Review and contact promptly.
            </Text>
          </Section>
          <Tailwind>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-[#666666]">Name</span>
                <span className="text-[#333333]">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-[#666666]">Email</span>
                <span className="text-[#333333]">{lead.email || "Not provided"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-[#666666]">Phone</span>
                <span className="text-[#333333]">{lead.phone || "Not provided"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-[#666666]">Service</span>
                <span className="text-[#333333]">{lead.service || "General inquiry"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-[#666666]">Urgency</span>
                <span className={`text-[#333333] font-semibold`}>{lead.urgency || "standard"}</span>
              </div>
              <div>
                <span className="text-[#666666] block mb-1">Details</span>
                <Text className="text-[#333333]">{lead.notes || "No details provided."}</Text>
              </div>
            </div>
          </Tailwind>
          <Section className="mt-[24px]">
            <Text className="text-[12px] leading-[20px] text-[#999999] text-center">
              This is an internal notification from the Concord automation system.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

InternalLeadAlertEmail.PreviewText = "New lead alert from the Concord website.";
InternalLeadAlertEmail.Subject = "New Lead Alert — review promptly";

export default InternalLeadAlertEmail;
