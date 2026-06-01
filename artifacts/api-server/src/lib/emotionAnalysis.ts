interface AnalysisInput {
  amount: number;
  category: string;
  emotion: string;
  reason: string;
}

interface AnalysisResult {
  spendingPattern: string;
  emotionalTrigger: string;
  personalizedAdvice: string;
}

const emotionPatterns: Record<string, { trigger: string; advice: string }> = {
  스트레스: {
    trigger: "스트레스 해소를 위한 즉흥적 소비 패턴이 감지됩니다. 부정적인 감정이 구매 결정을 이끌고 있어요.",
    advice: "스트레스를 받을 때 잠깐 멈추고 10분만 기다려보세요. 산책이나 심호흡처럼 비용이 들지 않는 해소법을 찾아보세요. 소비 전 감정 일기를 써보는 것도 좋습니다.",
  },
  슬픔: {
    trigger: "슬픔이나 외로움이 소비 욕구를 자극하고 있습니다. 감정적 공백을 물건으로 채우려는 경향이 보여요.",
    advice: "슬플 때의 소비는 일시적인 위안만 줄 수 있어요. 믿을 수 있는 친구나 가족과 시간을 보내는 것이 더 효과적입니다. 소비 대신 자신을 돌보는 활동을 선택해보세요.",
  },
  기쁨: {
    trigger: "기쁜 감정이 지출을 촉진하고 있습니다. 좋은 기분에서의 소비는 자연스럽지만, 예산 범위 내에서 즐기는 것이 중요해요.",
    advice: "기쁜 날의 소비는 자신에게 줄 수 있는 좋은 선물이에요. 다만 충동 구매보다는 미리 계획한 항목을 우선시하고, '기쁨 예산'을 따로 만들어보세요.",
  },
  외로움: {
    trigger: "외로움이 소비의 주요 원인이 되고 있습니다. 사람과의 연결 대신 물건에서 위안을 찾는 패턴이 나타나요.",
    advice: "외로울 때 소비보다 사람과의 연결을 먼저 찾아보세요. 동호회 참여나 봉사활동처럼 새로운 관계를 만드는 데 에너지를 투자해보는 것은 어떨까요?",
  },
  무료함: {
    trigger: "무료함이나 지루함이 소비를 유발하고 있습니다. 자극을 찾는 욕구가 구매로 이어지는 패턴이 보여요.",
    advice: "무료할 때 쇼핑 앱 대신 취미 활동을 시작해보세요. 새로운 책 읽기, 그림 그리기, 요리 등 창의적 활동이 쇼핑의 자극을 대체할 수 있어요.",
  },
  보상: {
    trigger: "자신에게 보상을 주고 싶은 심리가 소비로 이어지고 있습니다. 열심히 한 것에 대한 인정 욕구가 반영되어 있어요.",
    advice: "자신을 위한 보상은 필요하고 건강합니다. 하지만 금액 한도를 미리 정해두세요. 물질적 보상 외에도 특별한 경험이나 시간을 보상으로 선택하는 것도 좋아요.",
  },
  불안: {
    trigger: "불안감이 소비 행동을 유발하고 있습니다. 통제감을 얻기 위한 구매 패턴이 나타나요.",
    advice: "불안할 때 소비는 일시적 안도감을 줄 수 있지만 장기적으로 재정 스트레스를 증가시킬 수 있어요. 명상, 운동 등 비용 없는 불안 해소법을 찾아보세요.",
  },
  흥분: {
    trigger: "흥분이나 설렘이 충동 구매를 이끌고 있습니다. 감정이 고조되었을 때 판단력이 흐려지는 경향이 있어요.",
    advice: "흥분 상태에서는 24시간 기다리는 규칙을 적용해보세요. 하루 뒤에도 여전히 원한다면 그때 구매를 결정하세요. 카트에 담아두고 내일 확인하는 습관을 들여보세요.",
  },
};

const categoryPatterns: Record<string, string> = {
  음식: "음식 및 식음료 카테고리에서 감정 소비가 발생했습니다.",
  쇼핑: "쇼핑을 통해 감정적 욕구를 해소하는 패턴이 나타나고 있습니다.",
  오락: "오락 활동을 통해 감정을 전환하려는 경향이 보입니다.",
  뷰티: "외모 관리를 통해 감정 상태를 개선하려는 패턴이 감지됩니다.",
  교통: "이동을 통해 현재 감정 상태에서 벗어나려는 시도가 보입니다.",
  카페: "카페에서의 소비로 감정적 위안을 찾고 있습니다.",
  기타: "다양한 카테고리에서 감정 소비 패턴이 나타나고 있습니다.",
};

function getAmountLevel(amount: number): string {
  if (amount < 5000) return "소액";
  if (amount < 20000) return "중간";
  if (amount < 50000) return "고액";
  return "대액";
}

export function generateEmotionalAnalysis(input: AnalysisInput): AnalysisResult {
  const emotion = input.emotion;
  const category = input.category;
  const amountLevel = getAmountLevel(input.amount);

  const emotionData = emotionPatterns[emotion] ?? {
    trigger: `${emotion} 감정이 이번 소비의 주요 원인이 되었습니다. 감정과 소비의 연결 고리를 인식하는 것이 중요해요.`,
    advice: "소비 전 잠깐 멈추고 '지금 이것이 정말 필요한가?'를 스스로에게 물어보세요. 감정이 아닌 필요에 의한 소비를 연습해보세요.",
  };

  const categoryText = categoryPatterns[category] ?? `${category} 분야에서 감정 소비 패턴이 나타났습니다.`;

  const amountText = amountLevel === "소액"
    ? "소액이지만 빈번한 감정 소비는 누적되면 큰 금액이 될 수 있어요."
    : amountLevel === "대액"
    ? "이번 소비는 상당한 금액으로, 감정 상태가 큰 지출 결정에 영향을 미쳤습니다."
    : "";

  const spendingPattern = `${categoryText} ${amountText} ${input.reason}라는 이유로 ${emotion} 상태에서 ${input.amount.toLocaleString("ko-KR")}원을 지출했습니다.`.trim();

  const shortPatternMap: Record<string, string> = {
    스트레스: "스트레스가 소비를 이끌었어요",
    화남: "화가 난 순간의 소비였군요",
    불안: "불안한 마음이 지갑을 열었네요",
    우울: "우울한 하루의 흔적이에요",
    무기력: "그저그런 날의 소비예요",
    외로움: "외로운 마음이 구매로 이어졌네요",
    기쁨: "기쁜 날의 즐거운 소비예요",
    설렘: "설레는 마음이 구매로 이어졌네요",
    계획소비: "알뜰하게 계획한 소비예요",
  };

  const shortPattern = shortPatternMap[emotion]
    ?? `${emotion} 상태에서 한 소비예요`;

  return {
    spendingPattern,
    shortPattern,
    emotionalTrigger: emotionData.trigger,
    personalizedAdvice: emotionData.advice,
  };
}
