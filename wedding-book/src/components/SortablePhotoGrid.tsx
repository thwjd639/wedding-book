import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface AdminPhoto {
  id: string
  url: string
  order_index: number | null
}

function SortablePhotoItem({
  photo,
  onDelete,
}: {
  photo: AdminPhoto
  onDelete: (id: string, url: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} className="admin-photo-item" {...attributes} {...listeners}>
      <img src={photo.url} alt="웨딩 사진" draggable={false} />
      <button
        className="photo-delete-btn"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(photo.id, photo.url)
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        ✕
      </button>
    </div>
  )
}

interface Props {
  photos: AdminPhoto[]
  onReorder: (next: AdminPhoto[]) => void
  onDelete: (id: string, url: string) => void
}

// 업로드 순으로 기본 정렬되며, 드래그로 순서를 바꾸면 order_index가 즉시 갱신됩니다.
export default function SortablePhotoGrid({ photos, onReorder, onDelete }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = photos.findIndex((p) => p.id === active.id)
    const newIndex = photos.findIndex((p) => p.id === over.id)
    onReorder(arrayMove(photos, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="admin-photo-grid">
          {photos.map((photo) => (
            <SortablePhotoItem key={photo.id} photo={photo} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
