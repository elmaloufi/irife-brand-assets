import { EmptyState } from "../../src/components/EmptyState";
import { ScreenContainer } from "../../src/components/ScreenContainer";

export default function DiscoverScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        title="Discover Morocco"
        description="Published destinations and experiences will appear here after the catalogue API and database are connected."
      />
    </ScreenContainer>
  );
}
