export const supportedRegions = [
  'MA','FR','ES','GB','US','CA','DE','NL','AE','SA','BE','IT','PT','TR','CN','JP','BR','MX','IN','AU',
  'CH','AT','SE','NO','DK','FI','IE','GR','EG','TN','DZ','SN','CI','NG','ZA','SG','KR','TH','ID','MY',
  'NZ','PL','CZ','RO','HU','IL','QA','KW','OM','BH','JO','LB','PH','VN','AR','CL','CO','PE','KE','GH',
  'ET','TZ','UG','CM','MU','IS','LU','HR','BG','RS','UA','GE','AZ','KZ','PK','BD','LK','NP','KH','LA',
];

export function getRegionChoices(locale = 'en-MA') {
  let displayNames;
  try { displayNames = new Intl.DisplayNames([locale], { type: 'region' }); } catch { displayNames = null; }
  return supportedRegions.map((code) => ({ value: code, label: displayNames?.of(code) ?? code }))
    .sort((a, b) => a.value === 'MA' ? -1 : b.value === 'MA' ? 1 : a.label.localeCompare(b.label, locale));
}
