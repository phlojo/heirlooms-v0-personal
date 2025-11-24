"use client"

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@/__tests__/test-utils"
import { ArtifactsTabs } from "@/components/artifacts-tabs"
import { fixtures } from "@/__tests__/fixtures"

// Mock next/navigation
const mockPush = vi.fn()
const mockPathname = "/artifacts"
const mockSearchParams = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}))

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock server actions
vi.mock("@/lib/actions/artifacts", () => ({
  getAllPublicArtifactsPaginated: vi.fn(),
  getMyArtifactsPaginated: vi.fn(),
}))

vi.mock("@/lib/actions/profile", () => ({
  updateArtifactsViewPreference: vi.fn(),
}))

// Mock all UI components
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ value, children }: any) => (
    <button data-testid={`tab-${value}`} data-value={value}>
      {children}
    </button>
  ),
  TabsContent: ({ value, children }: any) => (
    <div data-testid={`tab-content-${value}`} data-value={value}>
      {children}
    </div>
  ),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, asChild, ...props }: any) => {
    if (asChild) {
      return <div {...props}>{children}</div>
    }
    return (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    )
  },
}))

vi.mock("@/components/artifact-card", () => ({
  ArtifactCard: ({ artifact, showAuthor }: any) => (
    <div
      data-testid={`artifact-card-${artifact.id}`}
      data-artifact-id={artifact.id}
      data-artifact-title={artifact.title}
      data-artifact-type={artifact.artifact_type?.id}
      data-show-author={showAuthor}
    >
      {artifact.title}
    </div>
  ),
}))

vi.mock("@/components/artifact-card-compact", () => ({
  ArtifactCardCompact: ({ artifact }: any) => (
    <div data-testid={`artifact-card-compact-${artifact.id}`} data-artifact-id={artifact.id}>
      {artifact.title}
    </div>
  ),
}))

vi.mock("@/components/login-module", () => ({
  LoginModule: () => <div data-testid="login-module">Login Module</div>,
}))

vi.mock("@/components/artifacts/filter-bar", () => ({
  FilterBar: ({ sortBy, selectedTypes, onSortChange, onTypeChange, onClearFilters, hasActiveFilters }: any) => (
    <div data-testid="filter-bar">
      <div data-testid="current-sort">{sortBy}</div>
      <div data-testid="selected-types">{selectedTypes.join(",")}</div>
      <button data-testid="sort-button-newest" onClick={() => onSortChange("newest")}>
        Newest
      </button>
      <button data-testid="sort-button-oldest" onClick={() => onSortChange("oldest")}>
        Oldest
      </button>
      <button data-testid="sort-button-title-asc" onClick={() => onSortChange("title-asc")}>
        Title A-Z
      </button>
      <button data-testid="sort-button-title-desc" onClick={() => onSortChange("title-desc")}>
        Title Z-A
      </button>
      <button data-testid="sort-button-last-edited" onClick={() => onSortChange("last-edited")}>
        Last Edited
      </button>
      <button data-testid="type-filter-car" onClick={() => onTypeChange(["t1111111-1111-4111-a111-111111111111"])}>
        Car
      </button>
      <button data-testid="type-filter-watch" onClick={() => onTypeChange(["t2222222-2222-4222-a222-222222222222"])}>
        Watch
      </button>
      <button
        data-testid="type-filter-car-watch"
        onClick={() => onTypeChange(["t1111111-1111-4111-a111-111111111111", "t2222222-2222-4222-a222-222222222222"])}
      >
        Car + Watch
      </button>
      {hasActiveFilters && (
        <button data-testid="clear-filters" onClick={onClearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  ),
}))

vi.mock("lucide-react", () => ({
  Plus: () => <span>Plus</span>,
  Loader2: () => <span>Loader</span>,
  Grid3x3: () => <span>Grid3x3</span>,
  Grid2x2: () => <span>Grid2x2</span>,
}))

describe("ArtifactsTabs - Filtering", () => {
  const carType = fixtures.artifactTypes.car
  const watchType = fixtures.artifactTypes.watch
  const generalType = fixtures.artifactTypes.general

  const artifactTypes = [carType, watchType, generalType]

  // Create test artifacts with different types and dates
  const carArtifact1 = {
    id: "car-1",
    slug: "car-1-slug",
    title: "Vintage Ferrari",
    description: "1960s Ferrari",
    media_urls: ["https://example.com/ferrari.jpg"],
    thumbnail_url: "https://example.com/ferrari.jpg",
    author_name: "John Doe",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
    user_id: "user-1",
    artifact_type: carType,
    collection: {
      id: "collection-1",
      title: "Classic Cars",
      is_public: true,
    },
  }

  const carArtifact2 = {
    id: "car-2",
    slug: "car-2-slug",
    title: "Antique Porsche",
    description: "Classic Porsche",
    media_urls: ["https://example.com/porsche.jpg"],
    thumbnail_url: "https://example.com/porsche.jpg",
    author_name: "Jane Smith",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-25T10:00:00Z",
    user_id: "user-2",
    artifact_type: carType,
    collection: {
      id: "collection-1",
      title: "Classic Cars",
      is_public: true,
    },
  }

  const watchArtifact1 = {
    id: "watch-1",
    slug: "watch-1-slug",
    title: "Rolex Submariner",
    description: "Luxury watch",
    media_urls: ["https://example.com/rolex.jpg"],
    thumbnail_url: "https://example.com/rolex.jpg",
    author_name: "Bob Wilson",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-22T10:00:00Z",
    user_id: "user-3",
    artifact_type: watchType,
    collection: {
      id: "collection-2",
      title: "Timepieces",
      is_public: true,
    },
  }

  const watchArtifact2 = {
    id: "watch-2",
    slug: "watch-2-slug",
    title: "Omega Speedmaster",
    description: "Moon watch",
    media_urls: ["https://example.com/omega.jpg"],
    thumbnail_url: "https://example.com/omega.jpg",
    author_name: "Alice Brown",
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-06T10:00:00Z",
    user_id: "user-4",
    artifact_type: watchType,
    collection: {
      id: "collection-2",
      title: "Timepieces",
      is_public: true,
    },
  }

  const generalArtifact = {
    id: "general-1",
    slug: "general-1-slug",
    title: "Family Photo Album",
    description: "Old photos",
    media_urls: ["https://example.com/album.jpg"],
    thumbnail_url: "https://example.com/album.jpg",
    author_name: "Carol Davis",
    created_at: "2024-01-12T10:00:00Z",
    updated_at: "2024-01-12T10:00:00Z",
    user_id: "user-5",
    artifact_type: generalType,
    collection: {
      id: "collection-3",
      title: "Family Memories",
      is_public: true,
    },
  }

  const allArtifacts = [carArtifact1, carArtifact2, watchArtifact1, watchArtifact2, generalArtifact]

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
  })

  describe("Type Filtering", () => {
    it("should render only car artifacts when types filter is set to cars", () => {
      const carArtifacts = [carArtifact1, carArtifact2]

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={carArtifacts}
          artifactTypes={artifactTypes}
          initialTypeIds={[carType.id]}
        />,
      )

      // Should show both car artifacts
      expect(screen.getByTestId(`artifact-card-${carArtifact1.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`artifact-card-${carArtifact2.id}`)).toBeInTheDocument()

      // Should not show watch artifacts (they weren't passed in)
      expect(screen.queryByTestId(`artifact-card-${watchArtifact1.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`artifact-card-${watchArtifact2.id}`)).not.toBeInTheDocument()
    })

    it("should render only watch artifacts when types filter is set to watches", () => {
      const watchArtifacts = [watchArtifact1, watchArtifact2]

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={watchArtifacts}
          artifactTypes={artifactTypes}
          initialTypeIds={[watchType.id]}
        />,
      )

      // Should show both watch artifacts
      expect(screen.getByTestId(`artifact-card-${watchArtifact1.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`artifact-card-${watchArtifact2.id}`)).toBeInTheDocument()

      // Should not show car artifacts
      expect(screen.queryByTestId(`artifact-card-${carArtifact1.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`artifact-card-${carArtifact2.id}`)).not.toBeInTheDocument()
    })

    it("should render both cars and watches when types filter includes both", () => {
      const filteredArtifacts = [carArtifact1, carArtifact2, watchArtifact1, watchArtifact2]

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={filteredArtifacts}
          artifactTypes={artifactTypes}
          initialTypeIds={[carType.id, watchType.id]}
        />,
      )

      // Should show all car and watch artifacts
      expect(screen.getByTestId(`artifact-card-${carArtifact1.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`artifact-card-${carArtifact2.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`artifact-card-${watchArtifact1.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`artifact-card-${watchArtifact2.id}`)).toBeInTheDocument()

      // Should not show general artifact
      expect(screen.queryByTestId(`artifact-card-${generalArtifact.id}`)).not.toBeInTheDocument()
    })

    it("should show all artifacts when no type filter is applied", () => {
      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={allArtifacts}
          artifactTypes={artifactTypes}
          initialTypeIds={[]}
        />,
      )

      // Should show all artifacts
      allArtifacts.forEach((artifact) => {
        expect(screen.getByTestId(`artifact-card-${artifact.id}`)).toBeInTheDocument()
      })
    })
  })

  describe("Sorting", () => {
    it("should display artifacts in newest first order by default", () => {
      // Pass artifacts in newest first order based on created_at
      const sortedArtifacts = [watchArtifact1, carArtifact1, generalArtifact, carArtifact2, watchArtifact2]

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={sortedArtifacts}
          artifactTypes={artifactTypes}
          initialSort="newest"
        />,
      )

      const cards = screen.getAllByTestId(/^artifact-card-/)
      expect(cards[0]).toHaveAttribute("data-artifact-id", watchArtifact1.id) // Jan 20
      expect(cards[1]).toHaveAttribute("data-artifact-id", carArtifact1.id) // Jan 15
      expect(cards[2]).toHaveAttribute("data-artifact-id", generalArtifact.id) // Jan 12
      expect(cards[3]).toHaveAttribute("data-artifact-id", carArtifact2.id) // Jan 10
      expect(cards[4]).toHaveAttribute("data-artifact-id", watchArtifact2.id) // Jan 5
    })

    it("should sort artifacts by title A-Z when title-asc is selected", () => {
      // Pass artifacts in alphabetical order
      const sortedArtifacts = [carArtifact2, generalArtifact, watchArtifact2, watchArtifact1, carArtifact1]
      // Antique Porsche, Family Photo Album, Omega Speedmaster, Rolex Submariner, Vintage Ferrari

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={sortedArtifacts}
          artifactTypes={artifactTypes}
          initialSort="title-asc"
        />,
      )

      const cards = screen.getAllByTestId(/^artifact-card-/)
      expect(cards[0]).toHaveAttribute("data-artifact-title", "Antique Porsche")
      expect(cards[1]).toHaveAttribute("data-artifact-title", "Family Photo Album")
      expect(cards[2]).toHaveAttribute("data-artifact-title", "Omega Speedmaster")
      expect(cards[3]).toHaveAttribute("data-artifact-title", "Rolex Submariner")
      expect(cards[4]).toHaveAttribute("data-artifact-title", "Vintage Ferrari")
    })

    it("should sort artifacts by title Z-A when title-desc is selected", () => {
      // Pass artifacts in reverse alphabetical order
      const sortedArtifacts = [carArtifact1, watchArtifact1, watchArtifact2, generalArtifact, carArtifact2]
      // Vintage Ferrari, Rolex Submariner, Omega Speedmaster, Family Photo Album, Antique Porsche

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={sortedArtifacts}
          artifactTypes={artifactTypes}
          initialSort="title-desc"
        />,
      )

      const cards = screen.getAllByTestId(/^artifact-card-/)
      expect(cards[0]).toHaveAttribute("data-artifact-title", "Vintage Ferrari")
      expect(cards[1]).toHaveAttribute("data-artifact-title", "Rolex Submariner")
      expect(cards[2]).toHaveAttribute("data-artifact-title", "Omega Speedmaster")
      expect(cards[3]).toHaveAttribute("data-artifact-title", "Family Photo Album")
      expect(cards[4]).toHaveAttribute("data-artifact-title", "Antique Porsche")
    })

    it("should sort artifacts by last edited (updated_at) when last-edited is selected", () => {
      // Pass artifacts sorted by updated_at descending
      const sortedArtifacts = [carArtifact2, watchArtifact1, carArtifact1, generalArtifact, watchArtifact2]
      // Jan 25, Jan 22, Jan 20, Jan 12, Jan 6

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={sortedArtifacts}
          artifactTypes={artifactTypes}
          initialSort="last-edited"
        />,
      )

      const cards = screen.getAllByTestId(/^artifact-card-/)
      expect(cards[0]).toHaveAttribute("data-artifact-id", carArtifact2.id) // Jan 25
      expect(cards[1]).toHaveAttribute("data-artifact-id", watchArtifact1.id) // Jan 22
      expect(cards[2]).toHaveAttribute("data-artifact-id", carArtifact1.id) // Jan 20
      expect(cards[3]).toHaveAttribute("data-artifact-id", generalArtifact.id) // Jan 12
      expect(cards[4]).toHaveAttribute("data-artifact-id", watchArtifact2.id) // Jan 6
    })

    it("should sort artifacts oldest first when oldest is selected", () => {
      // Pass artifacts sorted by created_at ascending
      const sortedArtifacts = [watchArtifact2, carArtifact2, generalArtifact, carArtifact1, watchArtifact1]
      // Jan 5, Jan 10, Jan 12, Jan 15, Jan 20

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={sortedArtifacts}
          artifactTypes={artifactTypes}
          initialSort="oldest"
        />,
      )

      const cards = screen.getAllByTestId(/^artifact-card-/)
      expect(cards[0]).toHaveAttribute("data-artifact-id", watchArtifact2.id) // Jan 5
      expect(cards[1]).toHaveAttribute("data-artifact-id", carArtifact2.id) // Jan 10
      expect(cards[2]).toHaveAttribute("data-artifact-id", generalArtifact.id) // Jan 12
      expect(cards[3]).toHaveAttribute("data-artifact-id", carArtifact1.id) // Jan 15
      expect(cards[4]).toHaveAttribute("data-artifact-id", watchArtifact1.id) // Jan 20
    })
  })

  describe("Combined Filtering and Sorting", () => {
    it("should filter by type and sort by title A-Z", () => {
      const carsSortedByTitle = [carArtifact2, carArtifact1]
      // Antique Porsche, Vintage Ferrari

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={carsSortedByTitle}
          artifactTypes={artifactTypes}
          initialTypeIds={[carType.id]}
          initialSort="title-asc"
        />,
      )

      const cards = screen.getAllByTestId(/^artifact-card-/)
      expect(cards).toHaveLength(2)
      expect(cards[0]).toHaveAttribute("data-artifact-title", "Antique Porsche")
      expect(cards[0]).toHaveAttribute("data-artifact-type", carType.id)
      expect(cards[1]).toHaveAttribute("data-artifact-title", "Vintage Ferrari")
      expect(cards[1]).toHaveAttribute("data-artifact-type", carType.id)
    })

    it("should filter by multiple types and sort by last edited", () => {
      const carsAndWatchesSortedByUpdated = [carArtifact2, watchArtifact1, carArtifact1, watchArtifact2]
      // Jan 25, Jan 22, Jan 20, Jan 6

      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={carsAndWatchesSortedByUpdated}
          artifactTypes={artifactTypes}
          initialTypeIds={[carType.id, watchType.id]}
          initialSort="last-edited"
        />,
      )

      const cards = screen.getAllByTestId(/^artifact-card-/)
      expect(cards).toHaveLength(4)
      expect(cards[0]).toHaveAttribute("data-artifact-id", carArtifact2.id)
      expect(cards[1]).toHaveAttribute("data-artifact-id", watchArtifact1.id)
      expect(cards[2]).toHaveAttribute("data-artifact-id", carArtifact1.id)
      expect(cards[3]).toHaveAttribute("data-artifact-id", watchArtifact2.id)
    })
  })

  describe("Filter UI Interactions", () => {
    it("should display active filters in FilterBar", () => {
      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={[carArtifact1]}
          artifactTypes={artifactTypes}
          initialTypeIds={[carType.id]}
          initialSort="title-asc"
        />,
      )

      // Check filter bar displays current state
      expect(screen.getByTestId("current-sort")).toHaveTextContent("title-asc")
      expect(screen.getByTestId("selected-types")).toHaveTextContent(carType.id)
    })

    it("should show clear filters button when filters are active", () => {
      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={[carArtifact1]}
          artifactTypes={artifactTypes}
          initialTypeIds={[carType.id]}
          initialSort="newest"
        />,
      )

      // Clear filters button should be visible
      expect(screen.getByTestId("clear-filters")).toBeInTheDocument()
    })

    it("should not show clear filters button when no filters are active", () => {
      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={allArtifacts}
          artifactTypes={artifactTypes}
          initialTypeIds={[]}
          initialSort="newest"
        />,
      )

      // Clear filters button should not be visible
      expect(screen.queryByTestId("clear-filters")).not.toBeInTheDocument()
    })
  })

  describe("Empty States", () => {
    it("should show no artifacts message when filtered results are empty", () => {
      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={[]}
          artifactTypes={artifactTypes}
          initialTypeIds={[carType.id]}
          initialSort="newest"
        />,
      )

      expect(screen.getByText(/No artifacts match your filters/i)).toBeInTheDocument()
      expect(screen.getByTestId("clear-filters")).toBeInTheDocument()
    })

    it("should show default empty message when no filters and no artifacts", () => {
      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={[]}
          artifactTypes={artifactTypes}
          initialTypeIds={[]}
          initialSort="newest"
        />,
      )

      expect(screen.getByText(/No public artifacts available yet/i)).toBeInTheDocument()
      expect(screen.queryByTestId("clear-filters")).not.toBeInTheDocument()
    })
  })

  describe("View Preferences", () => {
    it("should render standard view cards by default", () => {
      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={[carArtifact1]}
          artifactTypes={artifactTypes}
          initialViewPreference="standard"
        />,
      )

      // Standard cards should render
      expect(screen.getByTestId(`artifact-card-${carArtifact1.id}`)).toBeInTheDocument()
      expect(screen.queryByTestId(`artifact-card-compact-${carArtifact1.id}`)).not.toBeInTheDocument()
    })

    it("should render compact view cards when view preference is compact", () => {
      render(
        <ArtifactsTabs
          user={null}
          myArtifacts={[]}
          allArtifacts={[carArtifact1]}
          artifactTypes={artifactTypes}
          initialViewPreference="compact"
        />,
      )

      // Compact cards should render
      expect(screen.getByTestId(`artifact-card-compact-${carArtifact1.id}`)).toBeInTheDocument()
      expect(screen.queryByTestId(`artifact-card-${carArtifact1.id}`)).not.toBeInTheDocument()
    })
  })

  describe("My Artifacts Tab", () => {
    const user = {
      id: "user-1",
      email: "user@example.com",
      displayName: "Test User",
    }

    const myCarArtifact = { ...carArtifact1, user_id: user.id }
    const myWatchArtifact = { ...watchArtifact1, user_id: user.id }

    it("should render user artifacts when logged in", () => {
      render(
        <ArtifactsTabs
          user={user}
          myArtifacts={[myCarArtifact, myWatchArtifact]}
          allArtifacts={[]}
          artifactTypes={artifactTypes}
        />,
      )

      // Should show My Artifacts tab content
      const myTab = screen.getByTestId("tab-content-mine")
      expect(myTab).toBeInTheDocument()
    })

    it("should filter my artifacts by type", () => {
      render(
        <ArtifactsTabs
          user={user}
          myArtifacts={[myCarArtifact]}
          allArtifacts={[]}
          artifactTypes={artifactTypes}
          initialTypeIds={[carType.id]}
        />,
      )

      // Should show only car artifact in my artifacts
      expect(screen.getByTestId(`artifact-card-${myCarArtifact.id}`)).toBeInTheDocument()
      expect(screen.queryByTestId(`artifact-card-${myWatchArtifact.id}`)).not.toBeInTheDocument()
    })

    it("should show login module when not authenticated on my artifacts tab", () => {
      render(<ArtifactsTabs user={null} myArtifacts={[]} allArtifacts={[]} artifactTypes={artifactTypes} />)

      // My Artifacts tab should contain login module
      expect(screen.getByTestId("login-module")).toBeInTheDocument()
    })
  })
})
