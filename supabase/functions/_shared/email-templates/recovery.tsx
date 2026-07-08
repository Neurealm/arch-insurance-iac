/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
  token,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for {siteName}. Enter the
          code below on the reset page, or click the button.
        </Text>

        {token ? (
          <Section style={codeBox}>
            <Text style={codeLabel}>Your reset code</Text>
            <Text style={codeStyle}>{token}</Text>
          </Section>
        ) : null}

        <Button style={button} href={confirmationUrl}>
          Reset Password
        </Button>

        <Text style={footer}>
          If the button doesn't work — some corporate email systems open links
          automatically, which can invalidate them — just go to the reset page
          and enter the code above.
        </Text>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: 'hsl(222, 47%, 11%)', margin: '0 0 20px' }
const text = { fontSize: '15px', color: 'hsl(220, 12%, 35%)', lineHeight: '1.6', margin: '0 0 24px' }
const codeBox = { backgroundColor: 'hsl(232, 82%, 96%)', borderRadius: '12px', padding: '16px 20px', margin: '0 0 24px', textAlign: 'center' as const }
const codeLabel = { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'hsl(220, 12%, 45%)', margin: '0 0 6px' }
const codeStyle = { fontSize: '30px', fontWeight: 700 as const, letterSpacing: '0.3em', color: 'hsl(232, 82%, 22%)', margin: 0, fontFamily: 'monospace' }
const button = { backgroundColor: 'hsl(232, 82%, 22%)', color: '#ffffff', fontSize: '15px', fontWeight: 600 as const, borderRadius: '14px', padding: '14px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: 'hsl(220, 12%, 55%)', margin: '20px 0 0' }
