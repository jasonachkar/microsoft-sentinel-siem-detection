import React from 'react';
import ProofCard from './ProofCard';

export default function EvidenceCard({ item }) {
  return (
    <ProofCard
      title={item.title}
      summary={item.summary}
      status={item.status}
      skill={item.cloudSecuritySkill}
      repoPaths={item.repoPaths}
      talkingPoint={item.interviewTalkingPoint}
    />
  );
}
