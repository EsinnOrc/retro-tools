import React from "react";
import { Row, Col } from "antd";
import Card from "@/components/atoms/cards/cards";

interface CardData {
  title: string;
  description: string;
  buttonText: string;
  steps: string[];
  onButtonClick: () => void;
}

interface CardGroupProps {
  cards: CardData[];
}

const CardGroup: React.FC<CardGroupProps> = ({ cards }) => {
  return (
    <Row gutter={[16, 16]}>
      {cards.map((card, index) => (
        <Col xs={24} sm={12} md={8} key={index}>
          <Card {...card} />
        </Col>
      ))}
    </Row>
  );
};

export default CardGroup;
