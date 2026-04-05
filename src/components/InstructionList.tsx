import { View, Text } from 'react-native';
import { Instruction } from '../types/recipe';

interface InstructionListProps {
  instructions: Instruction[];
}

export function InstructionList({ instructions }: InstructionListProps) {
  return (
    <View className="gap-4">
      {instructions.map((instruction) => (
        <View key={instruction.stepNumber} className="flex-row gap-3">
          <View className="w-8 h-8 rounded-full bg-pink-500 items-center justify-center">
            <Text className="text-white font-bold text-sm">
              {instruction.stepNumber}
            </Text>
          </View>
          <Text className="flex-1 text-base text-gray-800 pt-1">
            {instruction.text}
          </Text>
        </View>
      ))}
    </View>
  );
}
