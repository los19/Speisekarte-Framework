import type { TeamSection as TeamSectionConfig } from '../../types/menu';
import '../../styles/sections/TeamSection.css';

interface TeamSectionProps {
  config: TeamSectionConfig;
}

export function TeamSection({ config }: TeamSectionProps) {
  const members = config.members || [];
  
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="team-section">
      <div className="team-container">
        <h2 className="team-title">{config.title || 'Unser Team'}</h2>
        <div className="team-grid">
          {members.map((member, index) => (
            <div key={index} className="team-member">
              {member.image && (
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
              )}
              <h3 className="member-name">{member.name}</h3>
              {member.role && <p className="member-role">{member.role}</p>}
              {member.description && <p className="member-description">{member.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamSection;

