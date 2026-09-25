import type { Messages } from '../i18n'
import type { Gender, ProfileInput } from '../types'

interface ProfileFieldsProps {
  profile: ProfileInput
  onChange: (profile: ProfileInput) => void
  messages: Messages
  secondary?: boolean
}

export default function ProfileFields({ profile, onChange, messages: t, secondary = false }: ProfileFieldsProps) {
  return (
    <div className="profile-fields">
      <label><span>{t.name}</span><input value={profile.name} onChange={(event) => onChange({ ...profile, name: event.target.value })} placeholder={secondary ? t.partnerPlaceholder : t.namePlaceholder} maxLength={32} /></label>
      <div className="field-row">
        <label><span>{t.birthDate}</span><input type="date" required value={profile.birthDate} onChange={(event) => onChange({ ...profile, birthDate: event.target.value })} max={new Date().toISOString().slice(0, 10)} /></label>
        <label><span>{t.birthTime}</span><input type="time" required value={profile.birthTime} onChange={(event) => onChange({ ...profile, birthTime: event.target.value })} /></label>
      </div>
      <fieldset>
        <legend>{t.gender}</legend>
        <div className="segment-control">
          {(['female', 'male', 'other'] as Gender[]).map((gender) => <button type="button" key={gender} className={profile.gender === gender ? 'selected' : ''} onClick={() => onChange({ ...profile, gender })}>{t[gender]}</button>)}
        </div>
      </fieldset>
    </div>
  )
}
