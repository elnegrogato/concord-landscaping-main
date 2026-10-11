import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface EstimateForApprovalEmailProps {
  estimate: {
    title: string;
    totalAmount: number;
    customerName: string;
    clientApprovalUrl: string;
    notes?: string;
  };
}

const EstimateForApprovalEmail = ({ estimate }: EstimateForApprovalEmailProps) => {
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(estimate.totalAmount);

  return (
    <Html>
      <Head />
      <Preview>Review and approve your estimate — {formattedTotal}</Preview>
      <Body className="bg-white font-sans">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto px-[20px] py-[30px] w-[465px]">
          <Section className="mt-[32px]">
            <Text className="text-[24px] font-light text-center px-[20px] py-[14px]">
              <span className="text-[#4A4A4A]">{estimate.title}</span>
            </Text>
            <Text className="text-[14px] leading-[24px] text-[#44403c]">
              Hi {estimate.customerName || "valued customer"},
            </Text>
            <Text className="text-[14px] leading-[24px] text-[#44403c]">
              We&apos;ve prepared this estimate for your upcoming project. Please review the details below and approve it directly through the link.
            </Text>
          </Section>
          <Section className="bg-[#f4f4f4] rounded px-[28px] py-[24px] text-center mb-[24px]">
            <Text className="text-[20px] font-semibold text-[#333333]">
              {formattedTotal}
            </Text>
            <Text className="text-[14px] leading-[24px] text-[#666666]">
              Estimated project total
            </Text>
          </Section>
          {estimate.notes && (
            <Section className="mb-[24px]">
              <Text className="text-[14px] leading-[24px] text-[#44403c]">
                <strong>Notes:</strong> {estimate.notes}
              </Text>
            </Section>
          )}
          <Section className="mb-[32px]">
            <Button
              className="bg-[#0F172A] rounded text-white text-[12px] font-semibold no-underline text-center px-[24px] py-[12px]"
              href={estimate.clientApprovalUrl || "#"}
            >
              Review & Approve Estimate
            </Button>
          </Section>
          <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
          <Text className="text-[12px] leading-[24px] text-[#666666] text-center">
            Concord Irrigation & Landscaping · Questions? Reply to this email or call (555) 123-4567
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

EstimateForApprovalEmail.PreviewText = "Review and approve your estimate - total ready.";
EstimateForApprovalEmail.Subject = "Review & approve your estimate";

export default EstimateForApprovalEmail;
