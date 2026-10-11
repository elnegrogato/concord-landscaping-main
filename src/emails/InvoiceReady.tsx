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

interface InvoiceReadyEmailProps {
  invoice: {
    invoiceNumber: string;
    totalAmount: number;
    dueDate: number;
    customerName: string;
    lineItems: any[];
    paymentUrl: string;
  };
}

const InvoiceReadyEmail = ({ invoice }: InvoiceReadyEmailProps) => {
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(invoice.totalAmount);

  return (
    <Html>
      <Head />
      <Preview>Your invoice #{invoice.invoiceNumber} is ready — total {formattedTotal}</Preview>
      <Body className="bg-white font-sans">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto px-[20px] py-[30px] w-[465px]">
          <Section className="mt-[32px]">
            <Text className="text-[24px] font-light text-center px-[20px] py-[14px]">
              <span className="text-[#4A4A4A]">Invoice #{invoice.invoiceNumber} Ready</span>
            </Text>
            <Text className="text-[14px] leading-[24px] text-[#44403c]">
              Hi {invoice.customerName || "valued customer"},
            </Text>
            <Text className="text-[14px] leading-[24px] text-[#44403c]">
              Your invoice for our recent work is now ready. Total due: <strong>{formattedTotal}</strong>. Payment is due by {new Date(invoice.dueDate).toLocaleDateString()}.
            </Text>
          </Section>
          <Section className="bg-[#f4f4f4] rounded px-[28px] py-[24px] text-center mb-[24px]">
            <Text className="text-[20px] font-semibold text-[#333333]">
              {formattedTotal}
            </Text>
            <Text className="text-[14px] leading-[24px] text-[#666666]">
              Total amount due
            </Text>
          </Section>
          <Section className="mb-[32px]">
            {invoice.lineItems && invoice.lineItems.length > 0 && (
              <Tailwind>
                <div className="text-left mb-4">
                  {invoice.lineItems.slice(0, 5).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-[#333333]">{item.description || "Service"}</span>
                      <span className="text-[#333333]">
                        ${item.price ? item.price.toFixed(2) : "0.00"}
                        {item.quantity && item.quantity !== 1 && (
                          <span className="text-[#666666] ml-2">x{item.quantity}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </Tailwind>
            )}
            <Button
              className="bg-[#0F172A] rounded text-white text-[12px] font-semibold no-underline text-center px-[24px] py-[12px]"
              href={invoice.paymentUrl || "#"}
            >
              Pay Invoice Now
            </Button>
          </Section>
          <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
          <Text className="text-[12px] leading-[24px] text-[#666666] text-center">
            Concord Irrigation & Landscaping · 123 Garden Way, Springfield, IL 62701
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

InvoiceReadyEmail.PreviewText = `Your invoice # is ready - total ready.`;
InvoiceReadyEmail.Subject = "Your invoice is ready — payable online";

export default InvoiceReadyEmail;
