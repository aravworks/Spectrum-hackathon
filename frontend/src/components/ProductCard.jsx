import { Link } from "react-router-dom";
import {
  ArrowRight,
  Package,
  Factory,
} from "lucide-react";

import DataConfidence from "./DataConfidence";

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-card-top">
        <div className="product-icon">
          <Package size={20} />
        </div>

        <DataConfidence
          type={product.confidence || "verified"}
        />
      </div>

      <div className="product-category">
        {product.category}
      </div>

      <h3>{product.name}</h3>

      <p>{product.description}</p>

      <div className="product-meta">
        <span>
          <Factory size={14} />
          {product.manufacturingLocation}
        </span>

        <span>
          {product.material}
        </span>
      </div>

      <Link
        to={`/product/${product.id}`}
        className="product-link"
      >
        View Product Passport
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

export default ProductCard;