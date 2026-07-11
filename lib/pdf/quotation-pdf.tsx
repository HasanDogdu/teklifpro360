'use client'

import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Image, Font,
} from '@react-pdf/renderer'
import type {
  Quotation, QuotationItem, CompanySettings, Customer, Currency,
} from '@/lib/types'
import { fmtCurrency, fmtDate, fmtNumber } from './pdf-utils'

// -------- Font registration (Roboto — tam Türkçe karakter destekli) --------
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.13/files/roboto-latin-ext-400-normal.woff', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.13/files/roboto-latin-ext-500-normal.woff', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.13/files/roboto-latin-ext-700-normal.woff', fontWeight: 700 },
  ],
})
Font.registerHyphenationCallback((word) => [word])

// -------- Styles --------
const COLORS = {
  primary: '#2563eb',
  primaryLight: '#eff6ff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  softBg: '#f8fafc',
  danger: '#dc2626',
  ok: '#059669',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 9.5,
    color: COLORS.text,
    paddingTop: 32,
    paddingBottom: 60,
    paddingHorizontal: 34,
  },

  // Header
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 18,
},
  companyBlock: {
  flexDirection: 'row',
  width: 360,
  flexShrink: 0,
},
  logo: {
  width: 92,
  height: 92,
  objectFit: 'contain',
  marginRight: 14,
  flexShrink: 0,
},
  companyInfo: {
  width: 250,
  flexShrink: 0,
},
  companyTitle: {
  fontSize: 15,
  lineHeight: 1.15,
  fontWeight: 700,
  color: COLORS.text,
  marginBottom: 6,
},
 companyMeta: {
  fontSize: 8.3,
  color: COLORS.muted,
  lineHeight: 1.3,
  marginBottom: 2,
},
  companyMetaStrong: {
  fontSize: 8.3,
  color: COLORS.text,
  fontWeight: 500,
  lineHeight: 1.3,
  marginBottom: 2,
},
  quoteBox: {
  width: 132,
  flexShrink: 0,
  borderWidth: 1,
  borderColor: COLORS.primary,
  borderRadius: 6,
  paddingVertical: 6,
  paddingHorizontal: 8,
  backgroundColor: COLORS.primaryLight,
  marginTop: 30,
},
  quoteBoxLabel: {fontSize: 7,textTransform: 'uppercase',letterSpacing: 0.4,color: COLORS.primary,fontWeight: 700, marginBottom: 2,},
 quoteNumber: {fontSize: 13,fontWeight: 700,color: COLORS.primary, marginBottom: 5,},
  quoteMetaRow: {flexDirection: 'row',justifyContent: 'space-between',fontSize: 7.3, marginBottom: 2,},
  quoteMetaLabel: {color: COLORS.muted,},
  quoteMetaValue: {fontWeight: 500,},

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.border, marginVertical: 10 },

  // Customer
  parties: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  partyCard: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 10, backgroundColor: COLORS.softBg },
  partyLabel: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.6, color: COLORS.muted, fontWeight: 700, marginBottom: 4 },
  partyName: { fontSize: 11, fontWeight: 700, marginBottom: 3 },
  partyLine: { fontSize: 8.5, color: COLORS.muted, lineHeight: 1.5 },

  // Table
  table: { marginTop: 4, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4 },
  thead: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    color: '#ffffff',
    paddingVertical: 6, paddingHorizontal: 6,
    fontSize: 8.5, fontWeight: 700,
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: 5, paddingHorizontal: 6,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
    fontSize: 8.5,
  },
  trAlt: { backgroundColor: COLORS.softBg },
  cellNo:    { width: '4%',  textAlign: 'center', color: COLORS.muted },
  cellDesc:  { width: '38%', paddingRight: 4 },
  cellUnit:  { width: '8%',  textAlign: 'center' },
  cellQty:   { width: '9%',  textAlign: 'right' },
  cellPrice: { width: '12%', textAlign: 'right' },
  cellDisc:  { width: '7%',  textAlign: 'right' },
  cellVat:   { width: '7%',  textAlign: 'right' },
  cellTotal: { width: '15%', textAlign: 'right', fontWeight: 700 },
  codeChip: { fontSize: 7.5, color: COLORS.primary, fontWeight: 700 },
  itemDesc: { fontSize: 8, color: COLORS.muted, marginTop: 1 },

  // Totals
  totalsWrap: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  totalsBox: { width: '45%', borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 10, backgroundColor: '#ffffff' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, fontSize: 9 },
  totalsLabel: { color: COLORS.muted },
  totalsValue: { fontWeight: 500 },
  totalsGrand: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 6, marginTop: 4,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  grandLabel: { fontSize: 10, fontWeight: 700 },
  grandValue: { fontSize: 13, fontWeight: 700, color: COLORS.primary },

  // Footer notes
  notes: { marginTop: 14, padding: 10, backgroundColor: COLORS.softBg, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border },
  notesLabel: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.6, color: COLORS.muted, fontWeight: 700, marginBottom: 3 },
  notesText: { fontSize: 8.5, color: COLORS.text, lineHeight: 1.55 },

  // Signature
  sigWrap: { flexDirection: 'row', gap: 20, marginTop: 22 },
  sigBox: { flex: 1, borderTopWidth: 1, borderTopColor: COLORS.text, paddingTop: 6 },
  sigLabel: { fontSize: 8, color: COLORS.muted, textAlign: 'center' },
  sigCompany: { fontSize: 9.5, fontWeight: 700, textAlign: 'center', marginTop: 2 },

  // Page footer
  pageFooter: {
    position: 'absolute',
    bottom: 22, left: 34, right: 34,
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 7.5, color: COLORS.muted,
    borderTopWidth: 0.5, borderTopColor: COLORS.border,
    paddingTop: 6,
  },
})

// -------- Component --------
type Props = {
  quotation: Quotation
  items: QuotationItem[]
  company: CompanySettings | null
  customer: Customer | null
}

export function QuotationPDF({ quotation, items, company, customer }: Props) {
  const currency = quotation.currency as Currency
  const c = company // shortcut
  const showLogo = c?.show_logo !== false && !!c?.logo_url
  const showSignature = c?.show_signature !== false
  const showStamp = c?.show_stamp === true
  const custSnap = (quotation as any).customer_snapshot || customer

  return (
    <Document
      title={`Teklif ${quotation.quote_number}`}
      author={c?.company_name || 'TeklifPro'}
    >
      <Page size="A4" style={styles.page}>
        {/* ============= HEADER ============= */}
        <View style={styles.header}>
          
<View style={styles.companyBlock}>
  {showLogo && (
    <Image
      src={{
        uri: c!.logo_url!,
        method: 'GET',
        body: '',
        headers: {},
      }}
      style={styles.logo}
    />
  )}

  <View style={styles.companyInfo}>
    <Text style={styles.companyTitle}>
      {c?.company_name || 'Firma Adı'}
    </Text>

    {c?.address && (
      <Text style={styles.companyMeta}>
        {c.address}
      </Text>
    )}

    {(c?.district || c?.city) && (
      <Text style={styles.companyMeta}>
        {[c?.district, c?.city].filter(Boolean).join(' / ')}
      </Text>
    )}

    {c?.phone && (
      <Text style={styles.companyMetaStrong}>
        Tel: {c.phone}
      </Text>
    )}

    {c?.email && (
      <Text style={styles.companyMeta}>
        E-posta: {c.email}
      </Text>
    )}

    {c?.website && (
      <Text style={styles.companyMeta}>
        Web: {c.website}
      </Text>
    )}

    {c?.tax_office && (
      <Text style={styles.companyMeta}>
        Vergi Dairesi: {c.tax_office}
      </Text>
    )}

    {c?.tax_number && (
      <Text style={styles.companyMeta}>
        Vergi No: {c.tax_number}
      </Text>
    )}

    {(c as any)?.registry_number && (
      <Text style={styles.companyMeta}>
        Sicil No: {(c as any).registry_number}
      </Text>
    )}
  </View>
</View>

          <View style={styles.quoteBox}>
            <Text style={styles.quoteBoxLabel}>Teklif Numarası</Text>
            <Text style={styles.quoteNumber}>{quotation.quote_number}</Text>
            <View style={styles.quoteMetaRow}>
              <Text style={styles.quoteMetaLabel}>Teklif Tarihi:</Text>
              <Text style={styles.quoteMetaValue}>{fmtDate(quotation.issue_date)}</Text>
            </View>
            {quotation.valid_until && (
              <View style={styles.quoteMetaRow}>
                <Text style={styles.quoteMetaLabel}>Geçerlilik:</Text>
                <Text style={styles.quoteMetaValue}>{fmtDate(quotation.valid_until)}</Text>
              </View>
            )}
            <View style={styles.quoteMetaRow}>
              <Text style={styles.quoteMetaLabel}>Para Birimi:</Text>
              <Text style={styles.quoteMetaValue}>{currency}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ============= PARTIES ============= */}
        <View style={styles.parties}>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>Satıcı</Text>
            <Text style={styles.partyName}>{c?.company_name || 'Firma Adı'}</Text>
            {c?.authorized_person && <Text style={styles.partyLine}>Yetkili: {c.authorized_person}</Text>}
            {c?.phone && <Text style={styles.partyLine}>Tel: {c.phone}</Text>}
            {c?.email && <Text style={styles.partyLine}>E-posta: {c.email}</Text>}
            {(c?.tax_office || c?.tax_number) && (
              <Text style={styles.partyLine}>
                {[c?.tax_office && `${c.tax_office} VD.`, c?.tax_number].filter(Boolean).join(' • ')}
              </Text>
            )}
          </View>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>Alıcı</Text>
            <Text style={styles.partyName}>{custSnap?.company_name || '—'}</Text>
            {custSnap?.contact_name && <Text style={styles.partyLine}>Yetkili: {custSnap.contact_name}</Text>}
            {custSnap?.phone && <Text style={styles.partyLine}>Tel: {custSnap.phone}</Text>}
            {custSnap?.email && <Text style={styles.partyLine}>E-posta: {custSnap.email}</Text>}
            {custSnap?.address && (
              <Text style={styles.partyLine}>
                {[custSnap.address, [custSnap.district, custSnap.city].filter(Boolean).join(' / ')].filter(Boolean).join(' • ')}
              </Text>
            )}
            {(custSnap?.tax_office || custSnap?.tax_number) && (
              <Text style={styles.partyLine}>
                {[custSnap?.tax_office && `${custSnap.tax_office} VD.`, custSnap?.tax_number].filter(Boolean).join(' • ')}
              </Text>
            )}
          </View>
        </View>

        {/* ============= ITEMS TABLE ============= */}
        <View style={styles.table}>
          {/* Header (repeats on each page) */}
          <View style={styles.thead} fixed>
            <Text style={styles.cellNo}>#</Text>
            <Text style={styles.cellDesc}>Açıklama</Text>
            <Text style={styles.cellUnit}>Birim</Text>
            <Text style={styles.cellQty}>Miktar</Text>
            <Text style={styles.cellPrice}>Birim Fiyat</Text>
            <Text style={styles.cellDisc}>İsk.%</Text>
            <Text style={styles.cellVat}>KDV%</Text>
            <Text style={styles.cellTotal}>Tutar</Text>
          </View>

          {items.length === 0 ? (
            <View style={styles.tr}>
              <Text style={{ ...styles.cellDesc, width: '100%', textAlign: 'center', color: COLORS.muted, fontStyle: 'italic' }}>
                Bu teklife henüz kalem eklenmediği.
              </Text>
            </View>
          ) : (
            items.map((it, idx) => (
              <View key={it.id} style={[styles.tr, idx % 2 === 1 ? styles.trAlt : {}]} wrap={false}>
                <Text style={styles.cellNo}>{idx + 1}</Text>
                <View style={styles.cellDesc}>
                  {it.product_code && <Text style={styles.codeChip}>{it.product_code}</Text>}
                  <Text style={styles.itemDesc}>{it.description}</Text>
                </View>
                <Text style={styles.cellUnit}>{it.unit}</Text>
                <Text style={styles.cellQty}>{fmtNumber(Number(it.quantity), 2)}</Text>
                <Text style={styles.cellPrice}>{fmtCurrency(Number(it.unit_price), currency)}</Text>
                <Text style={styles.cellDisc}>{fmtNumber(Number(it.discount_rate), 2)}</Text>
                <Text style={styles.cellVat}>{fmtNumber(Number(it.vat_rate), 2)}</Text>
                <Text style={styles.cellTotal}>{fmtCurrency(Number(it.line_total), currency)}</Text>
              </View>
            ))
          )}
        </View>

        {/* ============= TOTALS ============= */}
        <View style={styles.totalsWrap} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Ara Toplam</Text>
              <Text style={styles.totalsValue}>{fmtCurrency(Number(quotation.subtotal), currency)}</Text>
            </View>
            {Number(quotation.discount_amount) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>İskonto</Text>
                <Text style={styles.totalsValue}>- {fmtCurrency(Number(quotation.discount_amount), currency)}</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>KDV</Text>
              <Text style={styles.totalsValue}>{fmtCurrency(Number(quotation.vat_amount), currency)}</Text>
            </View>
            <View style={styles.totalsGrand}>
              <Text style={styles.grandLabel}>Genel Toplam</Text>
              <Text style={styles.grandValue}>{fmtCurrency(Number(quotation.total), currency)}</Text>
            </View>
          </View>
        </View>

        {/* ============= PAYMENT + FOOTER ============= */}
        {(quotation.payment_terms || quotation.footer_notes || c?.iban) && (
          <View style={styles.notes} wrap={false}>
            {quotation.payment_terms && (
              <>
                <Text style={styles.notesLabel}>Ödeme Şartları</Text>
                <Text style={{ ...styles.notesText, marginBottom: 6 }}>{quotation.payment_terms}</Text>
              </>
            )}
            {c?.iban && (
              <>
                <Text style={styles.notesLabel}>Hesap Bilgileri (IBAN)</Text>
                <Text style={{ ...styles.notesText, fontFamily: 'Courier', marginBottom: 6 }}>{c.iban}</Text>
              </>
            )}
            {quotation.footer_notes && (
              <>
                <Text style={styles.notesLabel}>Notlar</Text>
                <Text style={styles.notesText}>{quotation.footer_notes}</Text>
              </>
            )}
          </View>
        )}

        {/* ============= SIGNATURE / STAMP ============= */}
        {(showSignature || showStamp) && (
          <View style={styles.sigWrap} wrap={false}>
            {showSignature && (
              <View style={styles.sigBox}>
                <Text style={styles.sigLabel}>Yetkili İmza</Text>
                {c?.authorized_person && <Text style={styles.sigCompany}>{c.authorized_person}</Text>}
              </View>
            )}
            {showStamp && (
              <View style={styles.sigBox}>
                <Text style={styles.sigLabel}>Firma Kaşesi</Text>
              </View>
            )}
          </View>
        )}

        {/* ============= PAGE FOOTER (numbering) ============= */}
        <View style={styles.pageFooter} fixed>
          <Text>{c?.company_name || 'TeklifPro'} • {quotation.quote_number}</Text>
          <Text render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
