export interface FunctionalSpec {
  id: string;
  name: string;
  requirements: {
    label: string;
    value: string;
    unit?: string;
  }[];
  aiAdvice: string;
  structuralAdvice: string;
}

export const FUNCTIONAL_SPECS: Record<string, FunctionalSpec> = {
  main_dist: {
    id: 'main_dist',
    name: 'Main Distribution Hub',
    requirements: [
      { label: 'Voltage Rating', value: '480', unit: 'V' },
      { label: 'Current Capacity', value: '2500', unit: 'A' },
      { label: 'Protection', value: 'IP54' },
      { label: 'BIM Clearance', value: '3.0', unit: 'm' },
    ],
    aiAdvice: "Stationary hub requires direct vertical riser access. Thermal load suggests localized ventilation over-provisioning.",
    structuralAdvice: "Load-bearing impact: LOW. Riser placement minimizes shear wall disruption."
  },
  central_core: {
    id: 'central_core',
    name: 'Building Central Core',
    requirements: [
      { label: 'Fire Rating', value: '2', unit: 'hr' },
      { label: 'Load Bearing', value: '50', unit: 'kN/m2' },
      { label: 'MEP Penetrations', value: 'Max 12' },
    ],
    aiAdvice: "Dense structural obstruction. Recommend 'Spider-web' routing rather than orthogonal grid to maintain structural integrity.",
    structuralAdvice: "Load-bearing impact: CRITICAL. Any penetration >150mm requires structural reinforcement headers."
  },
  end_node: {
    id: 'end_node',
    name: 'Regional End Node',
    requirements: [
      { label: 'Voltage Rating', value: '120/208', unit: 'V' },
      { label: 'Branch Circuits', value: '42' },
      { label: 'Maintenance Access', value: 'Rear' },
    ],
    aiAdvice: "Flexible mounting recommended. Connector logic should be modular for future scalability.",
    structuralAdvice: "Load-bearing impact: NEGLIGIBLE. Wall-mount configuration distributes load across three studs."
  },
  hvac_a: {
    id: 'hvac_a',
    name: 'HVAC Unit A (Rooftop)',
    requirements: [
      { label: 'Air Flow', value: '12000', unit: 'CFM' },
      { label: 'Cooling Cap', value: '40', unit: 'Tons' },
      { label: 'Vibration Isolation', value: 'Spring' },
    ],
    aiAdvice: "Route ducts along the north corridor to minimize solar heat gain during transport.",
    structuralAdvice: "Load-bearing impact: MODERATE. Roof dunnage requires direct alignment with Main Column #04."
  },
  col_01: {
    id: 'col_01',
    name: 'Structural Column #01',
    requirements: [
      { label: 'Material', value: 'C45/55 Concrete' },
      { label: 'Reinforcement', value: 'High' },
      { label: 'No-Drill Zone', value: 'Direct' },
    ],
    aiAdvice: "MEP paths must stay 150mm away from the central axis to avoid shear-stress concentration.",
    structuralAdvice: "Load-bearing impact: HIGH. Column is primary vertical support member. Drilling is FORBIDDEN."
  }
};
